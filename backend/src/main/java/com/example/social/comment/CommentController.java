package com.example.social.comment;

import com.example.social.comment.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{postId}/comments")
    public CommentResponse addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        return commentService.addComment(
                authentication.getName(),
                postId,
                request);
    }

    @GetMapping("/{postId}/comments")
    public Page<CommentResponse> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return commentService.getComments(postId, page, size);
    }
}
