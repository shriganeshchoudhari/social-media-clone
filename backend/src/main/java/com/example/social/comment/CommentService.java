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

        Comment saved = commentRepository.save(comment);

        return new CommentResponse(
                saved.getId(),
                saved.getContent(),
                user.getUsername(),
                saved.getCreatedAt());
    }

    public Page<CommentResponse> getComments(Long postId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return commentRepository.findByPostId(postId, pageable)
                .map(c -> new CommentResponse(
                        c.getId(),
                        c.getContent(),
                        c.getAuthor().getUsername(),
                        c.getCreatedAt()));
    }
}
