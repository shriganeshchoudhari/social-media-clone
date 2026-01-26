package com.example.social.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private Long id;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private String actorUsername;
    private boolean read;
    private long timestamp = System.currentTimeMillis();

    // Constructor for simple message
    public NotificationDto(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }
}
