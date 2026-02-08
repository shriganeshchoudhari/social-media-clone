package com.example.social.user;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 200)
    private String bio;

    private String profileImageUrl;

    private LocalDateTime createdAt;

    @JsonProperty("isPrivate")
    private boolean isPrivate = false;

    private int tokenVersion = 0;

    private boolean isBanned = false;

    @Column(length = 20)
    private String role = "USER";

    private int warningCount = 0;

    private LocalDateTime bannedUntil;

    @Column(columnDefinition = "boolean default false")
    private boolean verified = false;

    public boolean isSuspended() {
        return bannedUntil != null && bannedUntil.isAfter(LocalDateTime.now());
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public User() {
    }

    public User(Long id, String username, String email, String password, String bio, String profileImageUrl,
            LocalDateTime createdAt, boolean isPrivate, int tokenVersion, boolean isBanned, String role,
            int warningCount, LocalDateTime bannedUntil, boolean verified) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
        this.isPrivate = isPrivate;
        this.tokenVersion = tokenVersion;
        this.isBanned = isBanned;
        this.role = role;
        this.warningCount = warningCount;
        this.bannedUntil = bannedUntil;
        this.verified = verified;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getBio() {
        return bio;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @JsonProperty("isPrivate")
    public boolean isPrivate() {
        return isPrivate;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public boolean isBanned() {
        return isBanned;
    }

    public String getRole() {
        return role;
    }

    public int getWarningCount() {
        return warningCount;
    }

    public LocalDateTime getBannedUntil() {
        return bannedUntil;
    }

    public boolean isVerified() {
        return verified;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public void setTokenVersion(int tokenVersion) {
        this.tokenVersion = tokenVersion;
    }

    public void setBanned(boolean isBanned) {
        this.isBanned = isBanned;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setWarningCount(int warningCount) {
        this.warningCount = warningCount;
    }

    public void setBannedUntil(LocalDateTime bannedUntil) {
        this.bannedUntil = bannedUntil;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    // Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private String bio;
        private String profileImageUrl;
        private LocalDateTime createdAt;
        private boolean isPrivate = false;
        private int tokenVersion = 0;
        private boolean isBanned = false;
        private String role = "USER";
        private int warningCount = 0;
        private LocalDateTime bannedUntil;
        private boolean verified = false;

        public UserBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public UserBuilder profileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserBuilder isPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
            return this;
        }

        public UserBuilder tokenVersion(int tokenVersion) {
            this.tokenVersion = tokenVersion;
            return this;
        }

        public UserBuilder isBanned(boolean isBanned) {
            this.isBanned = isBanned;
            return this;
        }

        public UserBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserBuilder warningCount(int warningCount) {
            this.warningCount = warningCount;
            return this;
        }

        public UserBuilder bannedUntil(LocalDateTime bannedUntil) {
            this.bannedUntil = bannedUntil;
            return this;
        }

        public UserBuilder verified(boolean verified) {
            this.verified = verified;
            return this;
        }

        public User build() {
            return new User(id, username, email, password, bio, profileImageUrl, createdAt, isPrivate, tokenVersion,
                    isBanned, role, warningCount, bannedUntil, verified);
        }
    }
}
