package com.example.social.admin;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User admin;

    private String action;

    private String targetUsername;

    private String details;

    private LocalDateTime createdAt = LocalDateTime.now();

    public AdminAuditLog() {
    }

    public AdminAuditLog(Long id, User admin, String action, String targetUsername, String details,
            LocalDateTime createdAt) {
        this.id = id;
        this.admin = admin;
        this.action = action;
        this.targetUsername = targetUsername;
        this.details = details;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetUsername() {
        return targetUsername;
    }

    public void setTargetUsername(String targetUsername) {
        this.targetUsername = targetUsername;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static AdminAuditLogBuilder builder() {
        return new AdminAuditLogBuilder();
    }

    public static class AdminAuditLogBuilder {
        private Long id;
        private User admin;
        private String action;
        private String targetUsername;
        private String details;
        private LocalDateTime createdAt = LocalDateTime.now();

        public AdminAuditLogBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AdminAuditLogBuilder admin(User admin) {
            this.admin = admin;
            return this;
        }

        public AdminAuditLogBuilder action(String action) {
            this.action = action;
            return this;
        }

        public AdminAuditLogBuilder targetUsername(String targetUsername) {
            this.targetUsername = targetUsername;
            return this;
        }

        public AdminAuditLogBuilder details(String details) {
            this.details = details;
            return this;
        }

        public AdminAuditLogBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AdminAuditLog build() {
            return new AdminAuditLog(id, admin, action, targetUsername, details, createdAt);
        }
    }
}
