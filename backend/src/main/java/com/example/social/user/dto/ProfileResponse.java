package com.example.social.user.dto;

public record ProfileResponse(
                String username,
                String bio,
                String profileImageUrl,
                long postCount,
                long followerCount,
                long followingCount,
                boolean following) {
}
