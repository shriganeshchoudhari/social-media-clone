package com.example.social.like;

import com.example.social.post.Post;
import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost(Post post);

    boolean existsByUserAndPost(User user, Post post);

    Optional<PostLike> findByUserAndPost(User user, Post post);

    void deleteByUserAndPost(User user, Post post);

    void deleteByUser(User user);

    void deleteByPost(Post post);
}
