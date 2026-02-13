package com.example.social.recommendation;

import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserInterestRepository;
import com.example.social.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    private final UserInterestRepository interestRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;

    private final com.example.social.post.SavedPostRepository savedPostRepo;
    private final com.example.social.like.PostLikeRepository postLikeRepository;

    public RecommendationService(
            UserInterestRepository interestRepo,
            PostRepository postRepo,
            UserRepository userRepo,
            com.example.social.post.SavedPostRepository savedPostRepo,
            com.example.social.like.PostLikeRepository postLikeRepository) {
        this.interestRepo = interestRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.savedPostRepo = savedPostRepo;
        this.postLikeRepository = postLikeRepository;
    }

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
                    boolean isSaved = savedPostRepo.existsByUserAndPost(user, post);
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
                            likedByMe,
                            isSaved,
                            post.getAuthor().getProfileImageUrl(),
                            post.getAuthor().isVerified(),
                            post.getLinkUrl(),
                            post.getLinkTitle(),
                            post.getLinkDescription(),
                            post.getLinkImage(),
                            null,
                            post.getSharedPost() != null ? new com.example.social.post.dto.PostResponse(
                                    post.getSharedPost().getId(),
                                    post.getSharedPost().getContent(),
                                    post.getSharedPost().getAuthor().getUsername(),
                                    post.getSharedPost().getImages().stream()
                                            .map(com.example.social.post.PostImage::getUrl).toList(),
                                    post.getSharedPost().getCreatedAt(),
                                    0L, // Like count for inner
                                    false, // likedByMe for inner
                                    false, // isSaved for inner
                                    post.getSharedPost().getAuthor().getProfileImageUrl(),
                                    post.getSharedPost().getAuthor().isVerified(),
                                    post.getSharedPost().getLinkUrl(),
                                    post.getSharedPost().getLinkTitle(),
                                    post.getSharedPost().getLinkDescription(),
                                    post.getSharedPost().getLinkImage(),
                                    null,
                                    null)
                                    : null);
                });
    }
}
