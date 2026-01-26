package com.example.social.like;

import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    private final com.example.social.notification.NotificationService notificationService;

    @Transactional
    public long toggleLike(String username, Long postId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (likeRepository.existsByUserAndPost(user, post)) {
            likeRepository.deleteByUserAndPost(user, post);
        } else {
            PostLike like = PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);

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

        return likeRepository.countByPost(post);
    }
}
