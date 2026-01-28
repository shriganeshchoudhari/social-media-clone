package com.example.social.chat.dto;

import java.time.LocalDateTime;

public record MessageResponse(
        Long id,
        String sender,
        String receiver,
        String content,
        String imageUrl,
        boolean isRead,
        LocalDateTime createdAt) {
}
