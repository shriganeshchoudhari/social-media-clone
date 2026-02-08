package com.example.social.like;

import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final com.example.social.notification.NotificationService notificationService;
    private final UserRepository userRepository;

    public PostLikeService(
            PostLikeRepository postLikeRepository,
            PostRepository postRepository,
            com.example.social.notification.NotificationService notificationService,
            com.example.social.user.BlockRepository blockRepository,
            UserRepository userRepository) {
        this.postLikeRepository = postLikeRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Transactional
    public long toggleLike(String username, Long postId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (postLikeRepository.existsByUserAndPost(user, post)) {
            postLikeRepository.deleteByUserAndPost(user, post);
        } else {
            PostLike like = PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();
            postLikeRepository.save(like);

            // Send notification to post author if it's not the liker themselves
            if (!post.getAuthor().getId().equals(user.getId())) {
                notificationService.create(
                        post.getAuthor(),
                        com.example.social.notification.NotificationType.LIKE,
                        post.getId(),
                        user.getUsername(),
                        user.getUsername() + " liked your post");
            }
        }

        return postLikeRepository.countByPost(post);
    }
}
