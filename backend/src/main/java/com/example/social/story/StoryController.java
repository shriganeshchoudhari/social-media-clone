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
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return storyService.createStory(user, file);
    }

    @GetMapping
    public java.util.List<StoryResponse> getFeedStories(Authentication authentication) {
        try {
            return storyService.getFeedStories(authentication.getName()).stream()
                    .map(StoryResponse::fromEntity)
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Debug Error: " + e.getMessage() + " | Cause: " + e.getCause());
        }
    }

    @GetMapping("/users/{userId}")
    public java.util.List<StoryResponse> getUserStories(@PathVariable Long userId) {
        // Need to fetch username from ID to reuse service method, or overload service
        User user = userRepository.findById(userId).orElseThrow();
        return storyService.getUserStories(user.getUsername()).stream()
                .map(StoryResponse::fromEntity)
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
}
