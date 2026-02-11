package com.example.social.post;

import com.example.social.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500, nullable = false)
    private String content;

    private String imageUrl;

    // Link Preview Metadata
    private String linkUrl;
    private String linkTitle;
    private String linkDescription;
    private String linkImage;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.example.social.comment.Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.example.social.like.PostLike> likes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavedPost> savedBy = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private com.example.social.group.Group group;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private com.example.social.poll.Poll poll;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Post() {
    }

    public Post(Long id, String content, String imageUrl, List<PostImage> images,
            List<com.example.social.comment.Comment> comments, List<com.example.social.like.PostLike> likes,
            List<SavedPost> savedBy, User author, com.example.social.group.Group group, LocalDateTime createdAt,
            String linkUrl, String linkTitle, String linkDescription, String linkImage,
            com.example.social.poll.Poll poll) {
        this.id = id;
        this.content = content;
        this.imageUrl = imageUrl;
        this.images = images != null ? images : new ArrayList<>();
        this.comments = comments != null ? comments : new ArrayList<>();
        this.likes = likes != null ? likes : new ArrayList<>();
        this.savedBy = savedBy != null ? savedBy : new ArrayList<>();
        this.author = author;
        this.group = group;
        this.createdAt = createdAt;
        this.linkUrl = linkUrl;
        this.linkTitle = linkTitle;
        this.linkDescription = linkDescription;
        this.linkImage = linkImage;
        this.poll = poll;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<PostImage> getImages() {
        return images;
    }

    public List<com.example.social.comment.Comment> getComments() {
        return comments;
    }

    public List<com.example.social.like.PostLike> getLikes() {
        return likes;
    }

    public List<SavedPost> getSavedBy() {
        return savedBy;
    }

    public User getAuthor() {
        return author;
    }

    public com.example.social.group.Group getGroup() {
        return group;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setImages(List<PostImage> images) {
        this.images = images;
    }

    public void setComments(List<com.example.social.comment.Comment> comments) {
        this.comments = comments;
    }

    public void setLikes(List<com.example.social.like.PostLike> likes) {
        this.likes = likes;
    }

    public void setSavedBy(List<SavedPost> savedBy) {
        this.savedBy = savedBy;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public void setGroup(com.example.social.group.Group group) {
        this.group = group;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Link Getters
    public String getLinkUrl() {
        return linkUrl;
    }

    public String getLinkTitle() {
        return linkTitle;
    }

    public String getLinkDescription() {
        return linkDescription;
    }

    public String getLinkImage() {
        return linkImage;
    }

    // Link Setters
    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public void setLinkTitle(String linkTitle) {
        this.linkTitle = linkTitle;
    }

    public void setLinkDescription(String linkDescription) {
        this.linkDescription = linkDescription;
    }

    public void setLinkImage(String linkImage) {
        this.linkImage = linkImage;
    }

    public com.example.social.poll.Poll getPoll() {
        return poll;
    }

    public void setPoll(com.example.social.poll.Poll poll) {
        this.poll = poll;
    }

    // Builder
    public static PostBuilder builder() {
        return new PostBuilder();
    }

    public static class PostBuilder {
        private Long id;
        private String content;
        private String imageUrl;
        private List<PostImage> images = new ArrayList<>();
        private List<com.example.social.comment.Comment> comments = new ArrayList<>();
        private List<com.example.social.like.PostLike> likes = new ArrayList<>();
        private List<SavedPost> savedBy = new ArrayList<>();
        private User author;
        private com.example.social.group.Group group;
        private LocalDateTime createdAt;
        // Link fields
        private String linkUrl;
        private String linkTitle;
        private String linkDescription;
        private String linkImage;
        private com.example.social.poll.Poll poll;

        public PostBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PostBuilder content(String content) {
            this.content = content;
            return this;
        }

        public PostBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public PostBuilder images(List<PostImage> images) {
            this.images = images;
            return this;
        }

        public PostBuilder comments(List<com.example.social.comment.Comment> comments) {
            this.comments = comments;
            return this;
        }

        public PostBuilder likes(List<com.example.social.like.PostLike> likes) {
            this.likes = likes;
            return this;
        }

        public PostBuilder savedBy(List<SavedPost> savedBy) {
            this.savedBy = savedBy;
            return this;
        }

        public PostBuilder author(User author) {
            this.author = author;
            return this;
        }

        public PostBuilder group(com.example.social.group.Group group) {
            this.group = group;
            return this;
        }

        public PostBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PostBuilder linkUrl(String linkUrl) {
            this.linkUrl = linkUrl;
            return this;
        }

        public PostBuilder linkTitle(String linkTitle) {
            this.linkTitle = linkTitle;
            return this;
        }

        public PostBuilder linkDescription(String linkDescription) {
            this.linkDescription = linkDescription;
            return this;
        }

        public PostBuilder linkImage(String linkImage) {
            this.linkImage = linkImage;
            return this;
        }

        public PostBuilder poll(com.example.social.poll.Poll poll) {
            this.poll = poll;
            return this;
        }

        public Post build() {
            return new Post(id, content, imageUrl, images, comments, likes, savedBy, author, group, createdAt, linkUrl,
                    linkTitle, linkDescription, linkImage, poll);
        }
    }
}
