package com.example.social.user.dto;

public record ProfileResponse(
                String username,
                String bio,
                String profileImageUrl,
                long followersCount,
                long followingCount,
                long postCount,
                boolean isPrivate,
                boolean following) {
}
