package com.example.social.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(Long userId, NotificationDto payload) {
        // Send to /topic/user/{userId}
        messagingTemplate.convertAndSend(
                "/topic/user/" + userId,
                payload);
    }
}
