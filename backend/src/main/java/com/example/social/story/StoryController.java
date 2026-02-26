package com.example.social.story;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final UserRepository userRepository;

    @PostMapping
    public Story createStory(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "pollQuestion", required = false) String pollQuestion,
            @RequestParam(value = "pollOptions", required = false) List<String> pollOptions,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return storyService.createStory(user, file, pollQuestion, pollOptions);
    }

    @GetMapping
    public java.util.List<StoryResponse> getFeedStories(Authentication authentication) {
        try {
            String username = authentication.getName();
            return storyService.getFeedStories(username).stream()
                    .map(story -> {
                        Long votedOptionId = storyService.getUserVoteForStory(story.getId(), username);
                        return StoryResponse.fromEntity(story, votedOptionId);
                    })
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Debug Error: " + e.getMessage() + " | Cause: " + e.getCause());
        }
    }

    @GetMapping("/users/{userId}")
    public java.util.List<StoryResponse> getUserStories(@PathVariable Long userId, Authentication authentication) {
        User user = userRepository.findById(userId).orElseThrow();
        String username = authentication.getName();
        return storyService.getUserStories(user.getUsername()).stream()
                .map(story -> {
                    Long votedOptionId = storyService.getUserVoteForStory(story.getId(), username);
                    return StoryResponse.fromEntity(story, votedOptionId);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/{storyId}/view")
    public void viewStory(@PathVariable Long storyId, Authentication authentication) {
        storyService.viewStory(storyId, authentication.getName());
    }

    @GetMapping("/{storyId}/viewers")
    public List<StoryViewerResponse> getStoryViewers(@PathVariable Long storyId, Authentication authentication) {
        return storyService.getStoryViewers(storyId, authentication.getName());
    }

    @PostMapping("/{storyId}/poll/{optionId}")
    public StoryPollVote voteStory(@PathVariable Long storyId, @PathVariable Long optionId,
            Authentication authentication) {
        return storyService.voteStoryPoll(storyId, optionId, authentication.getName());
    }
}
