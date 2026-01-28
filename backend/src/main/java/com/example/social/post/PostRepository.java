package com.example.social.post;

import java.util.List;

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

    List<Post> findAllByAuthor(com.example.social.user.User author);

    Page<Post> findByAuthor(com.example.social.user.User author, Pageable pageable);

    @Query("""
                SELECT p FROM Post p
                JOIN FETCH p.author
                WHERE p.id = :id
            """)
    java.util.Optional<Post> findPostByIdWithAuthor(@Param("id") Long id);

    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);
}
