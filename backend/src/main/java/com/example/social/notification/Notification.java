package com.example.social.notification;

import com.example.social.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private Long referenceId;

    private String actorUsername;

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
