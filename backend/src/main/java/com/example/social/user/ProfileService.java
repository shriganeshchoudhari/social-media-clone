package com.example.social.user;

import com.example.social.follow.FollowRepository;
import com.example.social.post.PostRepository;
import com.example.social.user.dto.ProfileResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;

    public ProfileResponse getProfile(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long postCount = postRepository.countByAuthorId(user.getId());
        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);

        return new ProfileResponse(
                user.getUsername(),
                user.getBio(),
                user.getProfileImageUrl(),
                postCount,
                followerCount,
                followingCount);
    }

    @Transactional
    public void updateProfile(String username, String bio, String imageUrl) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBio(bio);
        user.setProfileImageUrl(imageUrl);
    }
}
