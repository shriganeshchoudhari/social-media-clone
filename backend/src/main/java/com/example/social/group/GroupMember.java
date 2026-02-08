package com.example.social.group;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_group_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "group_id", "user_id" })
})
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRole role = GroupRole.MEMBER;

    private LocalDateTime joinedAt;

    @PrePersist
    void onCreate() {
        this.joinedAt = LocalDateTime.now();
    }

    public enum GroupRole {
        ADMIN,
        MODERATOR,
        MEMBER
    }

    public GroupMember() {
    }

    public GroupMember(Long id, Group group, User user, GroupRole role, LocalDateTime joinedAt) {
        this.id = id;
        this.group = group;
        this.user = user;
        this.role = role != null ? role : GroupRole.MEMBER;
        this.joinedAt = joinedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public GroupRole getRole() {
        return role;
    }

    public void setRole(GroupRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    // Builder
    public static GroupMemberBuilder builder() {
        return new GroupMemberBuilder();
    }

    public static class GroupMemberBuilder {
        private Long id;
        private Group group;
        private User user;
        private GroupRole role = GroupRole.MEMBER;
        private LocalDateTime joinedAt;

        public GroupMemberBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public GroupMemberBuilder group(Group group) {
            this.group = group;
            return this;
        }

        public GroupMemberBuilder user(User user) {
            this.user = user;
            return this;
        }

        public GroupMemberBuilder role(GroupRole role) {
            this.role = role;
            return this;
        }

        public GroupMemberBuilder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }

        public GroupMember build() {
            return new GroupMember(id, group, user, role, joinedAt);
        }
    }
}
