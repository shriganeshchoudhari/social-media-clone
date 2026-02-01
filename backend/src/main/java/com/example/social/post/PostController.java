package com.example.social.post;

import com.example.social.post.dto.PostResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final com.example.social.recommendation.RecommendationService recommendationService;

    @PostMapping(consumes = "multipart/form-data")
    public PostResponse createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images,
            Authentication authentication) {
        return postService.createPost(authentication.getName(), content, images);
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

    @GetMapping("/{id}")
    public PostResponse getOnePost(
            @PathVariable Long id,
            Authentication auth) {
        return postService.getPostById(id, auth.getName());
    }

    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable Long id,
            Authentication auth) {
        postService.deletePost(id, auth.getName());
    }

    @PutMapping("/{id}")
    public PostResponse editPost(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload,
            Authentication auth) {
        return postService.editPost(id, payload.get("content"), auth.getName());
    }

    @GetMapping("/user/{username}")
    public java.util.List<PostResponse> getPostsByUser(
            @PathVariable("username") String username,
            Authentication auth) {
        return postService.getPostsByUser(username, auth.getName());
    }

    @GetMapping("/explore")
    public Page<PostResponse> explore(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        return recommendationService.recommend(
                auth.getName(),
                org.springframework.data.domain.PageRequest.of(page, size));
    }

    @GetMapping("/search")
    public Page<PostResponse> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return postService.searchPosts(q, page, size, auth.getName());
    }

    @PostMapping("/{id}/save")
    public void toggleSavePost(
            @PathVariable Long id,
            Authentication auth) {
        postService.toggleSavePost(id, auth.getName());
    }

    @GetMapping("/saved")
    public Page<PostResponse> getSavedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return postService.getSavedPosts(auth.getName(), page, size);
    }

}
