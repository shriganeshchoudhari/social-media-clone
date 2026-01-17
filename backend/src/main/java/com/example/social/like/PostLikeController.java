package com.example.social.like;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/like")
    public long toggleLike(
            @PathVariable Long postId,
            Authentication authentication) {
        return postLikeService.toggleLike(authentication.getName(), postId);
    }
}
