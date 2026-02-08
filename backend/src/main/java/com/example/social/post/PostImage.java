package com.example.social.post;

import jakarta.persistence.*;

@Entity
@Table(name = "post_images")
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Post post;

    public PostImage() {
    }

    public PostImage(Long id, String url, Post post) {
        this.id = id;
        this.url = url;
        this.post = post;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String url;
        private Post post;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder url(String url) {
            this.url = url;
            return this;
        }

        public Builder post(Post post) {
            this.post = post;
            return this;
        }

        public PostImage build() {
            return new PostImage(id, url, post);
        }
    }
}
