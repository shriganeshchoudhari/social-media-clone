package com.example.social.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private String message;
    private long timestamp = System.currentTimeMillis();

    public NotificationDto(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }
}
