package com.example.social.user.dto;

import java.io.Serializable;

public record ProfileResponse(
                String username,
                String bio,
                String profileImageUrl,
                long followersCount,
                long followingCount,
                long postCount,
                boolean isPrivate,
                boolean following,
                boolean verified) implements Serializable {
}
