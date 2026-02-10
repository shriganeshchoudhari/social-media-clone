package com.example.social.chat;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    @Query("SELECT g FROM ChatGroup g JOIN g.participants p WHERE p = :user")
    List<ChatGroup> findByParticipant(@Param("user") User user);
}
