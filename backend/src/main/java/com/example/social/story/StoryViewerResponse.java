package com.example.social.story;

import java.time.LocalDateTime;

public record StoryViewerResponse(
        Long userId,
        String username,
        String profileImageUrl,
        LocalDateTime viewedAt) {
}
