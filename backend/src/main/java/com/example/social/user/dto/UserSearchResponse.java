package com.example.social.user.dto;

public record UserSearchResponse(
        String username,
        String bio,
        String profileImageUrl) {
}
