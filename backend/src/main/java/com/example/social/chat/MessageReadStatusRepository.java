package com.example.social.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.example.social.user.User;

public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    Optional<MessageReadStatus> findByMessageAndUser(Message message, User user);

    java.util.List<MessageReadStatus> findByMessage(Message message);
}
