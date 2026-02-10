package com.example.social.chat;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

        @org.springframework.data.jpa.repository.Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt DESC")
        org.springframework.data.domain.Page<Message> findConversation(
                        @org.springframework.data.repository.query.Param("user1") User user1,
                        @org.springframework.data.repository.query.Param("user2") User user2,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT m FROM Message m WHERE m.chatGroup = :group ORDER BY m.createdAt DESC")
        org.springframework.data.domain.Page<Message> findByChatGroup(
                        @org.springframework.data.repository.query.Param("group") ChatGroup group,
                        org.springframework.data.domain.Pageable pageable);

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
