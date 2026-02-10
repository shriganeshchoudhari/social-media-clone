package com.example.social.chat.dto;

import java.time.LocalDateTime;

import java.util.List;

public record MessageResponse(
        Long id,
        String sender,
        String senderProfileImage,
        String receiver,
        Long groupId,
        String content,
        String imageUrl,
        String voiceUrl,
        boolean isRead,
        List<ReactionResponse> reactions,
        LocalDateTime createdAt) {
}
