package com.example.social.notification;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPublisher publisher;

    public void create(User user, NotificationType type, Long referenceId, String actorUsername, String message) {

        // 1. Save to DB
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .referenceId(referenceId)
                .actorUsername(actorUsername)
                .message(message)
                .build();

        Notification saved = notificationRepository.save(notification);

        // 2. Broadcast to specific user (Real-time)
        NotificationDto payload = new NotificationDto(
                saved.getId(),
                saved.getMessage(),
                saved.getType(),
                saved.getReferenceId(),
                saved.getActorUsername(),
                false,
                System.currentTimeMillis());
        publisher.sendToUser(user.getId(), payload);
    }

    public List<Notification> getMyNotifications(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.findTop20ByUserOrderByCreatedAtDesc(user);
    }

    public long unreadCount(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAllRead(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        notificationRepository.markAllAsRead(user.getId());
    }

    public void markOneRead(Long id) {
        notificationRepository.markOneAsRead(id);
    }

    // Deprecated/Legacy support if needed, or remove.
    // Keeping this for compatibility requires refactoring PostLikeService etc to
    // use create()
    // public void sendNotification(Long userId, String message) { ... } -> Removed
    // in favor of create(User, String)

    // Deprecated/Legacy support
    // public void broadcast(String message) {
    // // publisher.broadcast(message); // If we implement broadcast in publisher
    // }
}
