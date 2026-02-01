package com.example.social.story;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StoryCleanupJob {

    private final StoryService storyService;

    // Run every hour (3600000 ms)
    @Scheduled(fixedRate = 3600000)
    public void cleanup() {
        storyService.cleanupExpiredStories();
    }
}
