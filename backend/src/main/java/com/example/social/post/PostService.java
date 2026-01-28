package com.example.social.post;

import com.example.social.like.PostLikeRepository;
import com.example.social.post.dto.*;
import com.example.social.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepository postRepository;
        private final UserRepository userRepository;
        private final PostLikeRepository postLikeRepository;
        private final com.example.social.file.FileStorageService fileStorageService;
        private final com.example.social.notification.NotificationService notificationService;

        public PostResponse createPost(String username, String content,
                        java.util.List<org.springframework.web.multipart.MultipartFile> images) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = Post.builder()
                                .content(content)
                                .author(user)
                                .build();

                // Handle multiple images
                if (images != null && !images.isEmpty()) {
                        for (org.springframework.web.multipart.MultipartFile file : images) {
                                if (!file.isEmpty()) {
                                        String url = fileStorageService.storeFile(file);

                                        PostImage postImage = PostImage.builder()
                                                        .url(url)
                                                        .post(post)
                                                        .build();

                                        post.getImages().add(postImage);
                                }
                        }
                }

                Post saved = postRepository.save(post);

                return mapToResponse(saved, user);
        }

        public Page<PostResponse> getFeed(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);

                // Use dummy user for public feed (likedByMe will always be false)
                return postRepository.findFeed(pageable)
                                .map(post -> {
                                        java.util.List<String> imageUrls = post.getImages().stream()
                                                        .map(PostImage::getUrl)
                                                        .toList();

                                        return new PostResponse(
                                                        post.getId(),
                                                        post.getContent(),
                                                        post.getAuthor().getUsername(),
                                                        imageUrls,
                                                        post.getCreatedAt(),
                                                        postLikeRepository.countByPost(post),
                                                        false);
                                });
        }

        public PostResponse getPostById(Long postId, String username) {
                User currentUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = postRepository.findPostByIdWithAuthor(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                return mapToResponse(post, currentUser);
        }

        public Page<PostResponse> getPersonalFeed(String username, int page, int size) {

                User currentUser = userRepository.findByUsername(username).orElseThrow();
                Pageable pageable = PageRequest.of(page, size);

                return postRepository
                                .findPersonalFeed(currentUser.getId(), pageable)
                                .map(post -> mapToResponse(post, currentUser));
        }

        private PostResponse mapToResponse(Post post, User currentUser) {

                long likeCount = postLikeRepository.countByPost(post);
                boolean likedByMe = postLikeRepository.existsByUserAndPost(currentUser, post);

                // Extract image URLs from PostImage entities
                java.util.List<String> imageUrls = post.getImages().stream()
                                .map(PostImage::getUrl)
                                .toList();

                return new PostResponse(
                                post.getId(),
                                post.getContent(),
                                post.getAuthor().getUsername(),
                                imageUrls,
                                post.getCreatedAt(),
                                likeCount,
                                likedByMe);
        }

        public void deletePost(Long postId, String username) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                // Verify ownership
                if (!post.getAuthor().getUsername().equals(username)) {
                        throw new RuntimeException("Not authorized to delete this post");
                }

                // Delete all associated images from filesystem
                for (PostImage img : post.getImages()) {
                        fileStorageService.deleteFile(img.getUrl());
                }

                // Delete the post (cascade will delete PostImage records)
                postRepository.delete(post);
        }

        public PostResponse editPost(Long postId, String content, String username) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                // Verify ownership
                if (!post.getAuthor().getUsername().equals(username)) {
                        throw new RuntimeException("Not authorized to edit this post");
                }

                post.setContent(content);
                Post saved = postRepository.save(post);

                return mapToResponse(saved, post.getAuthor());
        }
}
