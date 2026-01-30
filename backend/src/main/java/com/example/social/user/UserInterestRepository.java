package com.example.social.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    Optional<UserInterest> findTopByUser(User user);

    List<UserInterest> findByUser(User user);

    @Query("SELECT ui.tag FROM UserInterest ui WHERE ui.user = :user")
    List<String> findTagsByUser(User user);

    void deleteByUser(User user);
}
