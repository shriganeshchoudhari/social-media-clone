package com.example.social.post;

import com.example.social.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    boolean existsByUserAndPost(User user, Post post);

    Optional<SavedPost> findByUserAndPost(User user, Post post);

    Page<SavedPost> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
