package com.example.social.post;

import com.example.social.post.dto.PostResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Post creation, feed, and management endpoints")
public class PostController {

    private final PostService postService;
    private final com.example.social.recommendation.RecommendationService recommendationService;

    public PostController(PostService postService,
            com.example.social.recommendation.RecommendationService recommendationService) {
        this.postService = postService;
        this.recommendationService = recommendationService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Create new post", description = "Create a new post with optional images and group association")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Post created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public PostResponse createPost(
            @Parameter(description = "Post content text") @RequestParam("content") String content,
            @Parameter(description = "Optional images (max 10MB each)") @RequestParam(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images,
            @Parameter(description = "Optional group ID to post in") @RequestParam(value = "groupId", required = false) Long groupId,
            Authentication authentication) {
        return postService.createPost(authentication.getName(), content, images, groupId);
    }

    @GetMapping("/feed")
    @Operation(summary = "Get global feed", description = "Retrieve paginated global feed of all posts")
    public Page<PostResponse> getFeed(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
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
    @Operation(summary = "Explore recommended posts", description = "Get personalized post recommendations based on user interests")
    public Page<PostResponse> explore(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
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
