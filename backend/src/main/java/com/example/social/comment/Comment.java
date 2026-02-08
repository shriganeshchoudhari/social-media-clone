package com.example.social.comment;

import com.example.social.post.Post;
import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parentComment;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Comment() {
    }

    public Comment(Long id, String content, User author, Post post, Comment parentComment, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.post = post;
        this.parentComment = parentComment;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static CommentBuilder builder() {
        return new CommentBuilder();
    }

    public static class CommentBuilder {
        private Long id;
        private String content;
        private User author;
        private Post post;
        private Comment parentComment;
        private LocalDateTime createdAt;

        public CommentBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CommentBuilder content(String content) {
            this.content = content;
            return this;
        }

        public CommentBuilder author(User author) {
            this.author = author;
            return this;
        }

        public CommentBuilder post(Post post) {
            this.post = post;
            return this;
        }

        public CommentBuilder parentComment(Comment parentComment) {
            this.parentComment = parentComment;
            return this;
        }

        public CommentBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Comment build() {
            return new Comment(id, content, author, post, parentComment, createdAt);
        }
    }
}
