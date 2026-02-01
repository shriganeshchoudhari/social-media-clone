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

    @Transactional
    public Story createStory(User user, MultipartFile file) {
        String imageUrl = fileStorageService.storeFile(file);

        Story story = Story.builder()
                .user(user)
                .imageUrl(imageUrl)
                .build(); // onCreate will set times

        return storyRepository.save(story);
    }

    @Transactional(readOnly = true)
    public List<Story> getFeedStories(String username) {
        LocalDateTime now = LocalDateTime.now();
        // Global Story Feed to match Global Post Feed
        return storyRepository.findAllActiveStories(now);
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
}
