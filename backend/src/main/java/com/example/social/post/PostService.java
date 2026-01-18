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

        public PostResponse createPost(String username, CreatePostRequest request) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = Post.builder()
                                .content(request.content())
                                .author(user)
                                .build();

                Post saved = postRepository.save(post);

                return new PostResponse(
                                saved.getId(),
                                saved.getContent(),
                                user.getUsername(),
                                saved.getCreatedAt(),
                                postLikeRepository.countByPost(post),
                                postLikeRepository.existsByUserAndPost(user, post));
        }

        public Page<PostResponse> getFeed(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                return postRepository.findFeed(pageable)
                                .map(post -> new PostResponse(
                                                post.getId(),
                                                post.getContent(),
                                                post.getAuthor().getUsername(),
                                                post.getCreatedAt(),
                                                postLikeRepository.countByPost(post),
                                                false));
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

                return new PostResponse(
                                post.getId(),
                                post.getContent(),
                                post.getAuthor().getUsername(),
                                post.getCreatedAt(),
                                likeCount,
                                likedByMe);
        }
}
