package com.example.social.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByMessageAndUser(Message message, com.example.social.user.User user);

    void deleteByMessageAndUser(Message message, com.example.social.user.User user);
}
