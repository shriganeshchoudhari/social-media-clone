package com.example.social.group.invite;

import com.example.social.group.Group;
import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_invitations")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class GroupInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;

    @ManyToOne
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status;

    @Enumerated(EnumType.STRING)
    private InvitationType type = InvitationType.INVITE; // Default to old behavior

    private LocalDateTime createdAt;

    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    public enum InvitationType {
        INVITE, // Admin invited user
        JOIN_REQUEST // User requested to join
    }

    public GroupInvitation() {
    }

    public GroupInvitation(Long id, Group group, User inviter, User invitee, InvitationStatus status,
            InvitationType type, LocalDateTime createdAt) {
        this.id = id;
        this.group = group;
        this.inviter = inviter;
        this.invitee = invitee;
        this.status = status;
        this.type = type != null ? type : InvitationType.INVITE;
        this.createdAt = createdAt;
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

    public User getInviter() {
        return inviter;
    }

    public void setInviter(User inviter) {
        this.inviter = inviter;
    }

    public User getInvitee() {
        return invitee;
    }

    public void setInvitee(User invitee) {
        this.invitee = invitee;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public InvitationType getType() {
        return type;
    }

    public void setType(InvitationType type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static GroupInvitationBuilder builder() {
        return new GroupInvitationBuilder();
    }

    public static class GroupInvitationBuilder {
        private Long id;
        private Group group;
        private User inviter;
        private User invitee;
        private InvitationStatus status;
        private InvitationType type = InvitationType.INVITE;
        private LocalDateTime createdAt;

        public GroupInvitationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public GroupInvitationBuilder group(Group group) {
            this.group = group;
            return this;
        }

        public GroupInvitationBuilder inviter(User inviter) {
            this.inviter = inviter;
            return this;
        }

        public GroupInvitationBuilder invitee(User invitee) {
            this.invitee = invitee;
            return this;
        }

        public GroupInvitationBuilder status(InvitationStatus status) {
            this.status = status;
            return this;
        }

        public GroupInvitationBuilder type(InvitationType type) {
            this.type = type;
            return this;
        }

        public GroupInvitationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public GroupInvitation build() {
            return new GroupInvitation(id, group, inviter, invitee, status, type, createdAt);
        }
    }
}
