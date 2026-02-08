package com.example.social.post;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_posts", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "post_id" })
})
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Post post;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public SavedPost() {
    }

    public SavedPost(Long id, User user, Post post, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.createdAt = createdAt;
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

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static SavedPostBuilder builder() {
        return new SavedPostBuilder();
    }

    public static class SavedPostBuilder {
        private Long id;
        private User user;
        private Post post;
        private LocalDateTime createdAt;

        public SavedPostBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SavedPostBuilder user(User user) {
            this.user = user;
            return this;
        }

        public SavedPostBuilder post(Post post) {
            this.post = post;
            return this;
        }

        public SavedPostBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SavedPost build() {
            return new SavedPost(id, user, post, createdAt);
        }
    }
}
