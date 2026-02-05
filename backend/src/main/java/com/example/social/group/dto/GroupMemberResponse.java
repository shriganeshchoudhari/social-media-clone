package com.example.social.group.dto;

import com.example.social.group.GroupMember;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GroupMemberResponse {
    private Long id; // Member ID (not User ID)
    private Long userId;
    private String username;
    private String fullName;
    private String profileImageUrl;
    private GroupMember.GroupRole role;
    private LocalDateTime joinedAt;
}
