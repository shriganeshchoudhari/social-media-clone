package com.example.social.chat.dto;

import java.time.LocalDateTime;

public record ConversationResponse(
                String username,
                String lastMessage,
                LocalDateTime lastTime,
                String profileImage) {
}
