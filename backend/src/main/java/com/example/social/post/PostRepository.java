package com.example.social.post;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
                SELECT p FROM Post p
                JOIN FETCH p.author
                ORDER BY p.createdAt DESC
            """)
    Page<Post> findFeed(Pageable pageable);
}
