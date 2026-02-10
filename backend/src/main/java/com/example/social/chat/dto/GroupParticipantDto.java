package com.example.social.chat.dto;

public record GroupParticipantDto(
        Long id,
        String username,
        String profileImageUrl,
        boolean verified) {
}
