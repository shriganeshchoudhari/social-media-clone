package com.example.social.group;

import com.example.social.user.User;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity(name = "SocialGroup")
@Table(name = "social_groups")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private GroupPrivacy privacy = GroupPrivacy.PUBLIC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    private String coverImageUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pinned_post_id")
    private com.example.social.post.Post pinnedPost;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum GroupPrivacy {
        PUBLIC,
        PRIVATE
    }

    public Group() {
    }

    public Group(Long id, String name, String description, GroupPrivacy privacy, User creator, String coverImageUrl,
            com.example.social.post.Post pinnedPost, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.privacy = privacy != null ? privacy : GroupPrivacy.PUBLIC;
        this.creator = creator;
        this.coverImageUrl = coverImageUrl;
        this.pinnedPost = pinnedPost;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public GroupPrivacy getPrivacy() {
        return privacy;
    }

    public void setPrivacy(GroupPrivacy privacy) {
        this.privacy = privacy;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public com.example.social.post.Post getPinnedPost() {
        return pinnedPost;
    }

    public void setPinnedPost(com.example.social.post.Post pinnedPost) {
        this.pinnedPost = pinnedPost;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static GroupBuilder builder() {
        return new GroupBuilder();
    }

    public static class GroupBuilder {
        private Long id;
        private String name;
        private String description;
        private GroupPrivacy privacy = GroupPrivacy.PUBLIC;
        private User creator;
        private String coverImageUrl;
        private com.example.social.post.Post pinnedPost;
        private LocalDateTime createdAt;

        public GroupBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public GroupBuilder name(String name) {
            this.name = name;
            return this;
        }

        public GroupBuilder description(String description) {
            this.description = description;
            return this;
        }

        public GroupBuilder privacy(GroupPrivacy privacy) {
            this.privacy = privacy;
            return this;
        }

        public GroupBuilder creator(User creator) {
            this.creator = creator;
            return this;
        }

        public GroupBuilder coverImageUrl(String coverImageUrl) {
            this.coverImageUrl = coverImageUrl;
            return this;
        }

        public GroupBuilder pinnedPost(com.example.social.post.Post pinnedPost) {
            this.pinnedPost = pinnedPost;
            return this;
        }

        public GroupBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Group build() {
            return new Group(id, name, description, privacy, creator, coverImageUrl, pinnedPost, createdAt);
        }
    }
}
