package com.example.social.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(String username, NotificationDto payload) {
        // Send to /user/{username}/queue/notifications
        // This requires setApplicationDestinationPrefixes / userDestinationPrefix
        // config
        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications",
                payload);
    }
}
