package com.example.social.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(Long userId, String message) {
        // Broadcast to a specific topic that the user's frontend is listening to
        // Pattern: /topic/user/{userId}
        String destination = "/topic/user/" + userId;
        NotificationDto notification = new NotificationDto(message);
        messagingTemplate.convertAndSend(destination, notification);
    }

    public void broadcast(String message) {
        String destination = "/topic/public";
        NotificationDto notification = new NotificationDto(message);
        messagingTemplate.convertAndSend(destination, notification);
    }
}
