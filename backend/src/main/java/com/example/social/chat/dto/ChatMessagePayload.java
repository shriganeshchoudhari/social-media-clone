package com.example.social.chat.dto;

public record ChatMessagePayload(
        String receiver,
        String content) {
}
