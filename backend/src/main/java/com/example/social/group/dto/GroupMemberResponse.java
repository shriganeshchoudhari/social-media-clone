package com.example.social.group.dto;

import com.example.social.group.GroupMember;
import java.time.LocalDateTime;

public class GroupMemberResponse {
    private Long id; // Member ID (not User ID)
    private Long userId;
    private String username;
    private String fullName;
    private String profileImageUrl;
    private GroupMember.GroupRole role;
    private LocalDateTime joinedAt;

    public GroupMemberResponse() {
    }

    public GroupMemberResponse(Long id, Long userId, String username, String fullName, String profileImageUrl,
            GroupMember.GroupRole role, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public GroupMember.GroupRole getRole() {
        return role;
    }

    public void setRole(GroupMember.GroupRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private String username;
        private String fullName;
        private String profileImageUrl;
        private GroupMember.GroupRole role;
        private LocalDateTime joinedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder profileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
            return this;
        }

        public Builder role(GroupMember.GroupRole role) {
            this.role = role;
            return this;
        }

        public Builder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }

        public GroupMemberResponse build() {
            return new GroupMemberResponse(id, userId, username, fullName, profileImageUrl, role, joinedAt);
        }
    }
}
