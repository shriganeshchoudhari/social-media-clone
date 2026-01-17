package com.example.social.post;

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
                                saved.getCreatedAt());
        }

        public Page<PostResponse> getFeed(int page, int size) {

                Pageable pageable = PageRequest.of(page, size);

                return postRepository.findFeed(pageable)
                                .map(post -> new PostResponse(
                                                post.getId(),
                                                post.getContent(),
                                                post.getAuthor().getUsername(),
                                                post.getCreatedAt()));
        }

        public Page<PostResponse> getPersonalFeed(String username, int page, int size) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Pageable pageable = PageRequest.of(page, size);

                return postRepository.findPersonalFeed(user.getId(), pageable)
                                .map(post -> new PostResponse(
                                                post.getId(),
                                                post.getContent(),
                                                post.getAuthor().getUsername(),
                                                post.getCreatedAt()));
        }

}
