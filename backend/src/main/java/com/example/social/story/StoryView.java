package com.example.social.story;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "story_views", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "story_id", "viewer_id" })
})
public class StoryView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id", nullable = false)
    private User viewer;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    void onCreate() {
        this.viewedAt = LocalDateTime.now();
    }

    public StoryView() {
    }

    public StoryView(Long id, Story story, User viewer, LocalDateTime viewedAt) {
        this.id = id;
        this.story = story;
        this.viewer = viewer;
        this.viewedAt = viewedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public User getViewer() {
        return viewer;
    }

    public void setViewer(User viewer) {
        this.viewer = viewer;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }

    // Builder
    public static StoryViewBuilder builder() {
        return new StoryViewBuilder();
    }

    public static class StoryViewBuilder {
        private Long id;
        private Story story;
        private User viewer;
        private LocalDateTime viewedAt;

        public StoryViewBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public StoryViewBuilder story(Story story) {
            this.story = story;
            return this;
        }

        public StoryViewBuilder viewer(User viewer) {
            this.viewer = viewer;
            return this;
        }

        public StoryViewBuilder viewedAt(LocalDateTime viewedAt) {
            this.viewedAt = viewedAt;
            return this;
        }

        public StoryView build() {
            return new StoryView(id, story, viewer, viewedAt);
        }
    }
}
