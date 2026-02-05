package com.example.social.group.dto;

import java.time.LocalDateTime;

public record GroupResponse(
                Long id,
                String name,
                String description,
                String privacy,
                String creatorUsername,
                long memberCount,
                boolean isMember,
                String role, // ADMIN, MODERATOR, MEMBER, or null
                String coverImageUrl,
                Long pinnedPostId,
                LocalDateTime createdAt) {
}
