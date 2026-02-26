package com.example.social.chat.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record ChatGroupResponse(
                Long id,
                String name,
                String description,
                String rules,
                boolean isPublic,
                String imageUrl,
                LocalDateTime createdAt,
                Set<GroupParticipantDto> participants,
                Set<GroupParticipantDto> admins,
                Long creatorId,
                String creatorUsername) {
}
