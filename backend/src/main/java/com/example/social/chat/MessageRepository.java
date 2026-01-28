package com.example.social.chat;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtAsc(
            User sender1, User receiver1,
            User sender2, User receiver2);

    @org.springframework.data.jpa.repository.Query("""
                SELECT m FROM Message m
                WHERE m.sender = :user OR m.receiver = :user
                ORDER BY m.createdAt DESC
            """)
    List<Message> findRecentMessages(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("""
                UPDATE Message m
                SET m.isRead = true
                WHERE m.receiver = :me AND m.sender = :other
            """)
    void markRead(User me, User other);
}
