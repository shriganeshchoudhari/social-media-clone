package com.example.social.post;

import com.example.social.follow.FollowRepository;
import com.example.social.like.PostLikeRepository;
import com.example.social.post.dto.*;
import com.example.social.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepository postRepository;
        private final UserRepository userRepository;
        private final PostLikeRepository postLikeRepository;
        private final com.example.social.file.FileStorageService fileStorageService;
        private final FollowRepository followRepository;
        private final BlockRepository blockRepository;
        private final UserInterestRepository userInterestRepository;
        private final SavedPostRepository savedPostRepository;
        private final com.example.social.group.GroupRepository groupRepository;

        @org.springframework.transaction.annotation.Transactional
        public PostResponse createPost(String username, String content,
                        java.util.List<org.springframework.web.multipart.MultipartFile> images, Long groupId) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.example.social.group.Group group = null;
                if (groupId != null) {
                        group = groupRepository.findById(groupId)
                                        .orElseThrow(() -> new RuntimeException("Group not found"));
                        // Optional: Check if user is member of group before posting?
                        // For now, assume public/open or validated by frontend/logic elsewhere.
                }

                Post post = Post.builder()
                                .content(content)
                                .author(user)
                                .group(group)
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

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> getFeed(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                return postRepository.findFeed(pageable).map(this::mapToResponsePublic);
        }

        private PostResponse mapToResponsePublic(Post post) {
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
                                false,
                                false,
                                post.getAuthor().getProfileImageUrl(),
                                post.getAuthor().isVerified());
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public PostResponse getPostById(Long postId, String username) {
                User currentUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = postRepository.findPostByIdWithAuthor(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                return mapToResponse(post, currentUser);
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> getPersonalFeed(String username, int page, int size) {

                User currentUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
                Pageable pageable = PageRequest.of(page, size);

                return postRepository
                                .findPersonalFeed(currentUser.getId(), pageable)
                                .map(post -> mapToResponse(post, currentUser));
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> getPostsByUser(String viewerUsername, String targetUsername, int page, int size) {
                User viewer = userRepository.findByUsername(viewerUsername).orElseThrow();
                User target = userRepository.findByUsername(targetUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean isOwner = viewer.getId().equals(target.getId());
                boolean isFollowing = followRepository.existsByFollowerAndFollowing(viewer, target);

                if (!isOwner && target.isPrivate() && !isFollowing) {
                        throw new RuntimeException("This account is private");
                }

                Pageable pageable = PageRequest.of(page, size);
                return postRepository.findByAuthor(target, pageable)
                                .map(post -> mapToResponse(post, viewer));
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public java.util.List<PostResponse> getPostsByUser(String targetUsername, String viewerUsername) {
                User target = userRepository.findByUsername(targetUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                User viewer = userRepository.findByUsername(viewerUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean isOwner = viewer.getId().equals(target.getId());
                boolean isFollowing = followRepository.existsByFollowerAndFollowing(viewer, target);

                if (!isOwner && target.isPrivate() && !isFollowing) {
                        return java.util.Collections.emptyList();
                }

                return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(targetUsername)
                                .stream()
                                .map(post -> mapToResponse(post, viewer))
                                .toList();
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> explore(int page, int size, String username) {
                // Try personalized explore first
                return explorePersonalized(page, size, username);
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> explorePersonalized(int page, int size, String username) {
                User currentUser = userRepository.findByUsername(username).orElseThrow();
                Pageable pageable = PageRequest.of(page, size);

                // Check for user interests
                String tag = userInterestRepository.findTopByUser(currentUser)
                                .map(UserInterest::getTag)
                                .orElse(null);

                Page<Post> posts;
                if (tag != null) {
                        posts = postRepository.exploreByInterest(tag, pageable);
                } else {
                        // Fallback to trending
                        posts = postRepository.trending(pageable);
                }

                // Filter out posts from blocked users
                List<Post> filtered = posts.getContent().stream()
                                .filter(post -> !blockRepository.existsByBlockerAndBlocked(currentUser,
                                                post.getAuthor())
                                                && !blockRepository.existsByBlockerAndBlocked(post.getAuthor(),
                                                                currentUser))
                                .toList();

                return new PageImpl<>(
                                filtered.stream().map(post -> mapToResponse(post, currentUser)).toList(),
                                pageable,
                                posts.getTotalElements());
        }

        @org.springframework.transaction.annotation.Transactional
        public void toggleSavePost(Long postId, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                java.util.Optional<SavedPost> existing = savedPostRepository.findByUserAndPost(user, post);
                if (existing.isPresent()) {
                        savedPostRepository.delete(existing.get());
                } else {
                        savedPostRepository.save(SavedPost.builder()
                                        .user(user)
                                        .post(post)
                                        .build());
                }
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> getSavedPosts(String username, int page, int size) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Pageable pageable = PageRequest.of(page, size);

                return savedPostRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                                .map(saved -> mapToResponse(saved.getPost(), user));
        }

        private PostResponse mapToResponse(Post post, User currentUser) {

                long likeCount = postLikeRepository.countByPost(post);
                boolean likedByMe = postLikeRepository.existsByUserAndPost(currentUser, post);
                boolean isSaved = savedPostRepository.existsByUserAndPost(currentUser, post);

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
                                likedByMe,
                                isSaved,
                                post.getAuthor().getProfileImageUrl(),
                                post.getAuthor().isVerified());
        }

        @org.springframework.transaction.annotation.Transactional
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

        @org.springframework.transaction.annotation.Transactional
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

        @org.springframework.transaction.annotation.Transactional
        public void deleteAdminPost(Long postId) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                // Delete all associated images from filesystem
                for (PostImage img : post.getImages()) {
                        fileStorageService.deleteFile(img.getUrl());
                }
                postRepository.delete(post);
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> searchPosts(String query, int page, int size, String username) {
                User currentUser = userRepository.findByUsername(username).orElseThrow();
                Pageable pageable = PageRequest.of(page, size);

                Page<Post> posts = postRepository.searchByContent(query, pageable);

                // Filter blocked users
                java.util.List<Post> filtered = posts.getContent().stream()
                                .filter(post -> !blockRepository.existsByBlockerAndBlocked(currentUser,
                                                post.getAuthor())
                                                && !blockRepository.existsByBlockerAndBlocked(post.getAuthor(),
                                                                currentUser))
                                .toList();

                return new PageImpl<>(
                                filtered.stream().map(post -> mapToResponse(post, currentUser)).toList(),
                                pageable,
                                posts.getTotalElements());
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<PostResponse> mapPosts(Page<Post> posts, String username) {
                User currentUser = userRepository.findByUsername(username).orElseThrow();
                return posts.map(post -> mapToResponse(post, currentUser));
        }
}
