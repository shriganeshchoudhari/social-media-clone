package com.example.social.recommendation;

import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserInterestRepository;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserInterestRepository interestRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;

    private final com.example.social.like.PostLikeRepository postLikeRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<com.example.social.post.dto.PostResponse> recommend(String username, Pageable pageable) {
        User user = userRepo.findByUsername(username).orElseThrow();

        // Get all tags for user
        List<String> tags = interestRepo.findTagsByUser(user);

        // Fallback if less than 3 tags
        if (tags.size() < 1)
            tags.add("java");
        if (tags.size() < 2)
            tags.add("tech");
        if (tags.size() < 3)
            tags.add("coding");

        // Pass first 3 tags
        return postRepo.exploreMultiTag(
                tags.get(0),
                tags.get(1),
                tags.get(2),
                pageable).map(post -> {
                    long likeCount = postLikeRepository.countByPost(post);
                    boolean likedByMe = postLikeRepository.existsByUserAndPost(user, post);
                    java.util.List<String> imageUrls = post.getImages().stream()
                            .map(com.example.social.post.PostImage::getUrl)
                            .toList();

                    return new com.example.social.post.dto.PostResponse(
                            post.getId(),
                            post.getContent(),
                            post.getAuthor().getUsername(),
                            imageUrls,
                            post.getCreatedAt(),
                            likeCount,
                            likedByMe);
                });
    }
}
