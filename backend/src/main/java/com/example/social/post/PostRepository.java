package com.example.social.post;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Global feed (already exists)
    @Query("""
                SELECT DISTINCT p FROM Post p
                JOIN FETCH p.author
                LEFT JOIN FETCH p.images
                ORDER BY p.createdAt DESC
            """)
    Page<Post> findFeed(Pageable pageable);

    // Personalized feed
    @Query("""
                SELECT DISTINCT p FROM Post p
                JOIN FETCH p.author
                LEFT JOIN FETCH p.images
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
                LEFT JOIN FETCH p.images
                WHERE p.id = :id
            """)
    java.util.Optional<Post> findPostByIdWithAuthor(@Param("id") Long id);

    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);

    // Trending - using simple recency for now (complex aggregation causes HQL
    // issues)
    @Query("""
                SELECT p FROM Post p
                WHERE (SELECT COUNT(l) FROM PostLike l WHERE l.post = p) > 0
                ORDER BY p.createdAt DESC
            """)
    Page<Post> trending(Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :tag, '%'))
            ORDER BY p.createdAt DESC
            """)
    Page<Post> exploreByInterest(@Param("tag") String tag, Pageable pageable);

    @Query("""
                SELECT DISTINCT p FROM Post p
                WHERE (
                    LOWER(p.content) LIKE LOWER(CONCAT('%', :tag1, '%'))
                 OR LOWER(p.content) LIKE LOWER(CONCAT('%', :tag2, '%'))
                 OR LOWER(p.content) LIKE LOWER(CONCAT('%', :tag3, '%'))
                )
                ORDER BY p.createdAt DESC
            """)
    Page<Post> exploreMultiTag(
            @Param("tag1") String tag1,
            @Param("tag2") String tag2,
            @Param("tag3") String tag3,
            Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            JOIN FETCH p.author
            LEFT JOIN FETCH p.images
            WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY p.createdAt DESC
            """)
    Page<Post> searchByContent(@Param("query") String query, Pageable pageable);
}
