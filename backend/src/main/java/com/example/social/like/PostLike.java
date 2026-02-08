package com.example.social.like;

import com.example.social.post.Post;
import com.example.social.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "post_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "post_id" })
})
public class PostLike {

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

    public PostLike() {
    }

    public PostLike(Long id, User user, Post post) {
        this.id = id;
        this.user = user;
        this.post = post;
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

    // Builder
    public static PostLikeBuilder builder() {
        return new PostLikeBuilder();
    }

    public static class PostLikeBuilder {
        private Long id;
        private User user;
        private Post post;

        public PostLikeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PostLikeBuilder user(User user) {
            this.user = user;
            return this;
        }

        public PostLikeBuilder post(Post post) {
            this.post = post;
            return this;
        }

        public PostLike build() {
            return new PostLike(id, user, post);
        }
    }
}
