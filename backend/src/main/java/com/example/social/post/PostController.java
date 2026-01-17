package com.example.social.post;

import com.example.social.post.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public PostResponse createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication) {
        return postService.createPost(authentication.getName(), request);
    }

    @GetMapping("/feed")
    public Page<PostResponse> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getFeed(page, size);
    }

    @GetMapping("/feed/personal")
    public Page<PostResponse> getPersonalFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return postService.getPersonalFeed(authentication.getName(), page, size);
    }

}
