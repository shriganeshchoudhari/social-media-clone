package com.example.social.post;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Global feed (already exists)
    @Query("""
                SELECT p FROM Post p
                JOIN FETCH p.author
                ORDER BY p.createdAt DESC
            """)
    Page<Post> findFeed(Pageable pageable);

    // Personalized feed
    @Query("""
                SELECT p FROM Post p
                JOIN FETCH p.author
                WHERE p.author.id = :userId
                   OR p.author.id IN (
                       SELECT f.following.id
                       FROM Follow f
                       WHERE f.follower.id = :userId
                   )
                ORDER BY p.createdAt DESC
            """)
    Page<Post> findPersonalFeed(@Param("userId") Long userId, Pageable pageable);

    long countByAuthorId(Long authorId);
}
