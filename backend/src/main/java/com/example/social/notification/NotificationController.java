package com.example.social.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> myNotifications(Authentication auth) {
        List<Notification> notifications = notificationService.getMyNotifications(auth.getName());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(notifications);
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
