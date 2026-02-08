package com.example.social.notification;

public class NotificationDto {
    private Long id;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private String actorUsername;
    private boolean read;
    private long timestamp = System.currentTimeMillis();

    public NotificationDto() {
    }

    public NotificationDto(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public NotificationDto(Long id, String message, NotificationType type, Long referenceId, String actorUsername,
            boolean read, long timestamp) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.actorUsername = actorUsername;
        this.read = read;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getActorUsername() {
        return actorUsername;
    }

    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String message;
        private NotificationType type;
        private Long referenceId;
        private String actorUsername;
        private boolean read;
        private long timestamp = System.currentTimeMillis();

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder type(NotificationType type) {
            this.type = type;
            return this;
        }

        public Builder referenceId(Long referenceId) {
            this.referenceId = referenceId;
            return this;
        }

        public Builder actorUsername(String actorUsername) {
            this.actorUsername = actorUsername;
            return this;
        }

        public Builder read(boolean read) {
            this.read = read;
            return this;
        }

        public Builder timestamp(long timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public NotificationDto build() {
            return new NotificationDto(id, message, type, referenceId, actorUsername, read, timestamp);
        }
    }
}
