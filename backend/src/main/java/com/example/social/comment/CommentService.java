package com.example.social.comment;

import com.example.social.comment.dto.*;
import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final UserRepository userRepository;
        private final PostRepository postRepository;

        private final com.example.social.notification.NotificationService notificationService;

        @Transactional
        public CommentResponse addComment(String username, Long postId, CreateCommentRequest request) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                Comment comment = Comment.builder()
                                .content(request.content())
                                .author(user)
                                .post(post)
                                .build();

                if (request.parentId() != null) {
                        Comment parent = commentRepository.findById(request.parentId())
                                        .orElseThrow(() -> new RuntimeException("Parent comment not found"));
                        comment.setParentComment(parent);
                }

                Comment saved = commentRepository.save(comment);

                // Send notification to post author if not self-comment
                if (!post.getAuthor().getId().equals(user.getId())) {
                        notificationService.create(
                                        post.getAuthor(),
                                        com.example.social.notification.NotificationType.COMMENT,
                                        post.getId(),
                                        user.getUsername(),
                                        user.getUsername() + " commented on your post");
                }

                // Send notification to parent comment author if reply
                if (comment.getParentComment() != null
                                && !comment.getParentComment().getAuthor().getId().equals(user.getId())) {
                        notificationService.create(
                                        comment.getParentComment().getAuthor(),
                                        com.example.social.notification.NotificationType.COMMENT,
                                        post.getId(),
                                        user.getUsername(),
                                        user.getUsername() + " replied to your comment");
                }

                return new CommentResponse(
                                saved.getId(),
                                saved.getContent(),
                                user.getUsername(),
                                saved.getCreatedAt(),
                                saved.getParentComment() != null ? saved.getParentComment().getId() : null);
        }

        public Page<CommentResponse> getComments(Long postId, int page, int size) {

                Pageable pageable = PageRequest.of(page, size);

                return commentRepository.findByPostId(postId, pageable)
                                .map(c -> new CommentResponse(
                                                c.getId(),
                                                c.getContent(),
                                                c.getAuthor().getUsername(),
                                                c.getCreatedAt(),
                                                c.getParentComment() != null ? c.getParentComment().getId() : null));
        }
}
