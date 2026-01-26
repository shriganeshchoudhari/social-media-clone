package com.example.social.notification;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop20ByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsRead(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markOneAsRead(Long id);
}
