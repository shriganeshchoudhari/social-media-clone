package com.example.social.group.event;

import java.time.LocalDateTime;

public class GroupEventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private String location;
    private String organizerUsername;
    private Long organizerId;
    private LocalDateTime createdAt;

    public GroupEventResponse() {
    }

    public GroupEventResponse(Long id, String title, String description, LocalDateTime startTime, String location,
            String organizerUsername, Long organizerId, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.location = location;
        this.organizerUsername = organizerUsername;
        this.organizerId = organizerId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getOrganizerUsername() {
        return organizerUsername;
    }

    public void setOrganizerUsername(String organizerUsername) {
        this.organizerUsername = organizerUsername;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private String location;
        private String organizerUsername;
        private Long organizerId;
        private LocalDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder organizerUsername(String organizerUsername) {
            this.organizerUsername = organizerUsername;
            return this;
        }

        public Builder organizerId(Long organizerId) {
            this.organizerId = organizerId;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public GroupEventResponse build() {
            return new GroupEventResponse(id, title, description, startTime, location, organizerUsername, organizerId,
                    createdAt);
        }
    }
}
