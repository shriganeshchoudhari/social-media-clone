package com.example.social.follow;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

        private final FollowRepository followRepository;
        private final UserRepository userRepository;
        private final com.example.social.user.BlockRepository blockRepository;

        private final com.example.social.notification.NotificationService notificationService;

        @Transactional
        public void toggleFollow(String followerUsername, String followingUsername) {

                if (followerUsername.equals(followingUsername)) {
                        throw new RuntimeException("You cannot follow yourself");
                }

                User follower = userRepository.findByUsername(followerUsername)
                                .orElseThrow(() -> new RuntimeException("Follower not found"));

                User following = userRepository.findByUsername(followingUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (blockRepository.existsByBlockerAndBlocked(following, follower)) {
                        throw new RuntimeException("Cannot follow: You are blocked");
                }
                if (blockRepository.existsByBlockerAndBlocked(follower, following)) {
                        throw new RuntimeException("Cannot follow: You have blocked this user");
                }

                if (followRepository.existsByFollowerAndFollowing(follower, following)) {
                        followRepository.deleteByFollowerAndFollowing(follower, following);
                } else {
                        Follow follow = Follow.builder()
                                        .follower(follower)
                                        .following(following)
                                        .build();
                        followRepository.save(follow);

                        notificationService.create(
                                        following,
                                        com.example.social.notification.NotificationType.FOLLOW,
                                        follower.getId(),
                                        follower.getUsername(),
                                        follower.getUsername() + " followed you");
                }
        }

        @Transactional
        public List<String> getFollowing(String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return followRepository.findByFollower(user)
                                .stream()
                                .map(f -> f.getFollowing().getUsername())
                                .toList();
        }

        @Transactional
        public List<String> getFollowers(String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return followRepository.findByFollowing(user)
                                .stream()
                                .map(f -> f.getFollower().getUsername())
                                .toList();
        }
}
