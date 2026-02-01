package com.example.social.story;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    // Find active stories for a list of users (e.g. following + self)
    @Query("SELECT s FROM Story s WHERE s.user IN :users AND s.expiresAt > :now ORDER BY s.createdAt ASC")
    List<Story> findActiveStoriesByUsers(@Param("users") List<User> users, @Param("now") LocalDateTime now);

    // Find active stories for a specific user
    List<Story> findByUserAndExpiresAtAfterOrderByCreatedAtAsc(User user, LocalDateTime now);

    // Find ALL active stories (Global Feed)
    @Query("SELECT s FROM Story s JOIN FETCH s.user WHERE s.expiresAt > :now ORDER BY s.createdAt ASC")
    List<Story> findAllActiveStories(@Param("now") LocalDateTime now);

    // Find expired stories for cleanup
    List<Story> findByExpiresAtBefore(LocalDateTime now);
}
