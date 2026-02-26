package com.example.social.chat;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    @Query("SELECT g FROM ChatGroup g JOIN g.participants p WHERE p = :user")
    List<ChatGroup> findByParticipant(@Param("user") User user);

    @Query("SELECT g FROM ChatGroup g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%')) AND g.isPublic = true")
    List<ChatGroup> searchPublicGroups(@Param("name") String name);
}
