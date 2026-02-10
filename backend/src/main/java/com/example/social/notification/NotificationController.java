package com.example.social.notification;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

        private final NotificationService notificationService;

        public NotificationController(NotificationService notificationService) {
                this.notificationService = notificationService;
        }

        @GetMapping
        public ResponseEntity<List<NotificationDto>> myNotifications(Authentication auth) {
                List<Notification> notifications = notificationService.getMyNotifications(auth.getName());
                List<NotificationDto> dtos = notifications.stream()
                                .map(n -> new NotificationDto(
                                                n.getId(),
                                                n.getMessage(),
                                                n.getType(),
                                                n.getReferenceId(),
                                                n.getActorUsername(),
                                                n.isRead(),
                                                java.time.ZoneId.systemDefault().getRules()
                                                                .getOffset(java.time.Instant.now()).getTotalSeconds()
                                                                * 1000
                                                                + n.getCreatedAt().toEpochSecond(
                                                                                java.time.ZoneOffset.UTC) * 1000 // Approximate
                                                                                                                 // or
                                                                                                                 // better:
                                // n.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                                // Simpler:
                                // java.sql.Timestamp.valueOf(n.getCreatedAt()).getTime()
                                ))
                                .toList();

                // Fix timestamp conversion
                dtos = notifications.stream().map(n -> new NotificationDto(
                                n.getId(),
                                n.getMessage(),
                                n.getType(),
                                n.getReferenceId(),
                                n.getActorUsername(),
                                n.isRead(),
                                n.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()))
                                .toList();

                return ResponseEntity.ok()
                                .cacheControl(CacheControl.noCache().mustRevalidate())
                                .body(dtos);
        }

        @GetMapping("/unread-count")
        public ResponseEntity<Long> unreadCount(Authentication auth) {
                long count = notificationService.unreadCount(auth.getName());
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.noCache().mustRevalidate())
                                .body(count);
        }

        @PostMapping("/mark-all-read")
        public void markAllRead(Authentication auth) {
                notificationService.markAllRead(auth.getName());
        }

        @PostMapping("/{id}/read")
        public void markOneRead(@PathVariable Long id) {
                notificationService.markOneRead(id);
        }
}
