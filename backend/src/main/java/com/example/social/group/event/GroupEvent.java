package com.example.social.group.event;

import com.example.social.group.Group;
import com.example.social.user.User;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_group_events")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class GroupEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String location;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public GroupEvent() {
    }

    public GroupEvent(Long id, Group group, User organizer, String title, String description, LocalDateTime startTime,
            LocalDateTime endTime, String location, LocalDateTime createdAt) {
        this.id = id;
        this.group = group;
        this.organizer = organizer;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getOrganizer() {
        return organizer;
    }

    public void setOrganizer(User organizer) {
        this.organizer = organizer;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder
    public static GroupEventBuilder builder() {
        return new GroupEventBuilder();
    }

    public static class GroupEventBuilder {
        private Long id;
        private Group group;
        private User organizer;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private LocalDateTime createdAt;

        public GroupEventBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public GroupEventBuilder group(Group group) {
            this.group = group;
            return this;
        }

        public GroupEventBuilder organizer(User organizer) {
            this.organizer = organizer;
            return this;
        }

        public GroupEventBuilder title(String title) {
            this.title = title;
            return this;
        }

        public GroupEventBuilder description(String description) {
            this.description = description;
            return this;
        }

        public GroupEventBuilder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }

        public GroupEventBuilder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }

        public GroupEventBuilder location(String location) {
            this.location = location;
            return this;
        }

        public GroupEventBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public GroupEvent build() {
            return new GroupEvent(id, group, organizer, title, description, startTime, endTime, location, createdAt);
        }
    }
}
