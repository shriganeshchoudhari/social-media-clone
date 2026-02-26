package com.example.social.story;

import com.example.social.file.FileStorageService;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final StoryViewRepository storyViewRepository;
    private final StoryPollVoteRepository storyPollVoteRepository;
    private final StoryPollRepository storyPollRepository;

    @Transactional
    public Story createStory(User user, MultipartFile file) {
        return createStory(user, file, null, null);
    }

    @Transactional
    public Story createStory(User user, MultipartFile file, String pollQuestion, List<String> pollOptions) {
        String imageUrl = fileStorageService.storeFile(file);

        Story story = Story.builder()
                .user(user)
                .imageUrl(imageUrl)
                .build();

        if (pollQuestion != null && !pollQuestion.isBlank() && pollOptions != null && !pollOptions.isEmpty()) {
            StoryPoll poll = StoryPoll.builder()
                    .question(pollQuestion)
                    .story(story)
                    .build();

            List<StoryPollOption> options = new java.util.ArrayList<>();
            for (String optText : pollOptions) {
                options.add(StoryPollOption.builder()
                        .text(optText)
                        .poll(poll)
                        .voteCount(0)
                        .build());
            }
            poll.setOptions(options);
            story.setPoll(poll);
        }

        return storyRepository.save(story);
    }

    @Transactional(readOnly = true)
    public List<Story> getFeedStories(String username) {
        LocalDateTime now = LocalDateTime.now();
        // Global Story Feed to match Global Post Feed
        return storyRepository.findAllActiveStories(now);
    }

    // Helper to get vote status
    @Transactional(readOnly = true)
    public Long getUserVoteForStory(Long storyId, String username) {
        Story story = storyRepository.findById(storyId).orElse(null);
        if (story == null || story.getPoll() == null)
            return null;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return null;

        return storyPollVoteRepository.findByPollAndUser(story.getPoll(), user)
                .map(vote -> vote.getOption().getId())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Story> getUserStories(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return storyRepository.findByUserAndExpiresAtAfterOrderByCreatedAtAsc(user, LocalDateTime.now());
    }

    @Transactional
    public void cleanupExpiredStories() {
        LocalDateTime now = LocalDateTime.now();
        List<Story> expired = storyRepository.findByExpiresAtBefore(now);

        for (Story story : expired) {
            // Delete file
            fileStorageService.deleteFile(story.getImageUrl());
            // Delete from DB
            storyRepository.delete(story);
        }

        if (!expired.isEmpty()) {
            System.out.println("Cleaned up " + expired.size() + " expired stories.");
        }
    }

    @Transactional
    public void viewStory(Long storyId, String username) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        User viewer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (story.getUser().getId().equals(viewer.getId())) {
            return;
        }

        if (!storyViewRepository.existsByStoryAndViewer(story, viewer)) {
            try {
                StoryView view = StoryView.builder()
                        .story(story)
                        .viewer(viewer)
                        .build();
                storyViewRepository.save(view);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // Ignore duplicate view
            }
        }
    }

    @Transactional(readOnly = true)
    public List<StoryViewerResponse> getStoryViewers(Long storyId, String username) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        if (!story.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to see viewers");
        }

        return storyViewRepository.findByStoryOrderByViewedAtDesc(story).stream()
                .map(view -> new StoryViewerResponse(
                        view.getViewer().getId(),
                        view.getViewer().getUsername(),
                        view.getViewer().getProfileImageUrl(),
                        view.getViewedAt()))
                .toList();
    }

    @Transactional
    public StoryPollVote voteStoryPoll(Long storyId, Long optionId, String username) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        if (story.getPoll() == null) {
            throw new RuntimeException("Story has no poll");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already voted
        if (storyPollVoteRepository.existsByPollAndUser(story.getPoll(), user)) {
            throw new RuntimeException("Already voted");
        }

        // Find option
        StoryPollOption option = story.getPoll().getOptions().stream()
                .filter(opt -> opt.getId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Option not found"));

        // Increment count
        option.setVoteCount(option.getVoteCount() + 1);

        // Save vote
        StoryPollVote vote = StoryPollVote.builder()
                .poll(story.getPoll())
                .user(user)
                .option(option)
                .build();

        return storyPollVoteRepository.save(vote);
    }
}
