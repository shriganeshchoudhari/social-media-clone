package com.example.social.story;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stories")
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Transient
    private long viewCount;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.expiresAt == null) {
            this.expiresAt = this.createdAt.plusHours(24);
        }
    }

    public Story() {
    }

    public Story(Long id, User user, String imageUrl, LocalDateTime createdAt, LocalDateTime expiresAt,
            long viewCount) {
        this.id = id;
        this.user = user;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.viewCount = viewCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }

    // Builder
    public static StoryBuilder builder() {
        return new StoryBuilder();
    }

    public static class StoryBuilder {
        private Long id;
        private User user;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
        private long viewCount;

        public StoryBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public StoryBuilder user(User user) {
            this.user = user;
            return this;
        }

        public StoryBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public StoryBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public StoryBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public StoryBuilder viewCount(long viewCount) {
            this.viewCount = viewCount;
            return this;
        }

        public Story build() {
            return new Story(id, user, imageUrl, createdAt, expiresAt, viewCount);
        }
    }
}
