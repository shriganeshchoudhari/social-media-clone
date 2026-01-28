package com.example.social.comment;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
                SELECT c FROM Comment c
                JOIN FETCH c.author
                WHERE c.post.id = :postId
                ORDER BY c.createdAt ASC
            """)
    Page<Comment> findByPostId(Long postId, Pageable pageable);

    void deleteByAuthor(com.example.social.user.User author);

    void deleteByPost(com.example.social.post.Post post);
}
