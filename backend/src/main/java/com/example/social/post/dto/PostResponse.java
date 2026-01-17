package com.example.social.post.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String content,
        String authorUsername,
        LocalDateTime createdAt) {
}
