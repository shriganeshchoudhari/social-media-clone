package com.example.social.user;

import com.example.social.post.Post;
import com.example.social.post.PostImage;
import com.example.social.user.dto.ProfileResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.social.file.FileStorageService fileStorageService;
    private final com.example.social.post.PostRepository postRepository;
    private final com.example.social.like.PostLikeRepository postLikeRepository;
    private final com.example.social.comment.CommentRepository commentRepository;
    private final com.example.social.follow.FollowRepository followRepository;
    private final BlockRepository blockRepository;
    private final UserInterestRepository userInterestRepository;
    private final com.example.social.activity.ActivityLogService activityLogService;
    private final com.example.social.search.UserSyncService userSyncService;
    private final com.example.social.search.UserSearchRepository userSearchRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            com.example.social.file.FileStorageService fileStorageService,
            com.example.social.post.PostRepository postRepository,
            com.example.social.like.PostLikeRepository postLikeRepository,
            com.example.social.comment.CommentRepository commentRepository,
            com.example.social.follow.FollowRepository followRepository,
            BlockRepository blockRepository,
            UserInterestRepository userInterestRepository,
            com.example.social.activity.ActivityLogService activityLogService,
            com.example.social.search.UserSyncService userSyncService,
            com.example.social.search.UserSearchRepository userSearchRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.followRepository = followRepository;
        this.blockRepository = blockRepository;
        this.userInterestRepository = userInterestRepository;
        this.activityLogService = activityLogService;
        this.userSyncService = userSyncService;
        this.userSearchRepository = userSearchRepository;
    }

    public void toggleBlock(String me, String targetUsername) {
        User blocker = getUserByUsername(me);
        User blocked = getUserByUsername(targetUsername);

        if (blocker.getId().equals(blocked.getId())) {
            throw new RuntimeException("Cannot block yourself");
        }

        if (blockRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            blockRepository.deleteByBlockerAndBlocked(blocker, blocked);
        } else {
            // Unfollow if blocking
            if (followRepository.existsByFollowerAndFollowing(blocker, blocked)) {
                followRepository.deleteByFollowerAndFollowing(blocker, blocked);
            }
            if (followRepository.existsByFollowerAndFollowing(blocked, blocker)) {
                followRepository.deleteByFollowerAndFollowing(blocked, blocker);
            }

            Block b = new Block();
            b.setBlocker(blocker);
            b.setBlocked(blocked);
            blockRepository.save(b);
            activityLogService.logActivity(blocker.getId(), blocker.getUsername(), "BLOCK_USER",
                    "Blocked user: " + targetUsername, null);
        }
    }

    // ... (existing helper methods)

    @Transactional
    public void deleteAccount(String username) {
        User user = getUserByUsername(username);

        // 1. Delete all likes made by this user
        postLikeRepository.deleteByUser(user);

        // 2. Delete all comments made by this user
        commentRepository.deleteByAuthor(user);

        // 3. Delete all follows (follower and following)
        followRepository.deleteByFollower(user);
        followRepository.deleteByFollowing(user);

        // 4. Delete posts (and associated images/likes/comments)
        List<Post> posts = postRepository.findAllByAuthor(user);
        for (Post post : posts) {
            // Delete likes on this post
            postLikeRepository.deleteByPost(post);

            // Delete comments on this post
            commentRepository.deleteByPost(post);

            // Delete images files from storage
            for (PostImage img : post.getImages()) {
                fileStorageService.deleteFile(img.getUrl());
            }
        }

        postRepository.deleteAll(posts);

        userRepository.delete(user);
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#username")
    public User updateProfile(String username, String bio, MultipartFile avatar, List<String> interests) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        // Update bio
        if (bio != null) {
            user.setBio(bio);
        }

        // Update avatar
        if (avatar != null && !avatar.isEmpty()) {
            String url = fileStorageService.storeFile(avatar);
            user.setProfileImageUrl(url);
        }

        // Update interests
        if (interests != null) {
            // Delete existing interests
            userInterestRepository.deleteByUser(user);

            // Add new interests
            for (String tag : interests) {
                if (tag != null && !tag.trim().isEmpty()) {
                    UserInterest interest = new UserInterest();
                    interest.setUser(user);
                    interest.setTag(tag.trim());
                    userInterestRepository.save(interest);
                }
            }
        }

        User savedUser = userRepository.save(user);
        userSyncService.syncUser(savedUser);
        activityLogService.logActivity(savedUser.getId(), savedUser.getUsername(), "UPDATE_PROFILE",
                "Updated profile details", null);
        return savedUser;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + username));
    }

    public java.util.Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Cacheable(value = "userProfiles", key = "#targetUsername")
    public ProfileResponse getProfile(String viewerUsername, String targetUsername) {
        User me = getUserByUsername(viewerUsername);
        User target = getUserByUsername(targetUsername);

        boolean following = followRepository.existsByFollowerAndFollowing(me, target);
        long postCount = postRepository.countByAuthorId(target.getId());
        long followersCount = followRepository.countByFollowing(target);
        long followingCount = followRepository.countByFollower(target);

        return new ProfileResponse(
                target.getUsername(),
                target.getBio(),
                target.getProfileImageUrl(),
                followersCount,
                followingCount,
                postCount,
                target.isPrivate(),
                following,
                target.isVerified());
    }

    public User togglePrivacy(String username) {
        User user = getUserByUsername(username);
        user.setPrivate(!user.isPrivate());
        User saved = userRepository.save(user);
        userSyncService.syncUser(saved);
        activityLogService.logActivity(saved.getId(), saved.getUsername(), "TOGGLE_PRIVACY",
                "Changed privacy to: " + saved.isPrivate(), null);
        return saved;
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = getUserByUsername(username);

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        // Enforce minimum rules
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate
                                                          // tokens
        userRepository.save(user);
        activityLogService.logActivity(user.getId(), user.getUsername(), "CHANGE_PASSWORD",
                "Password changed successfully", null);
    }

    public void warn(String username) {
        User user = getUserByUsername(username);
        user.setWarningCount(user.getWarningCount() + 1);
        userRepository.save(user);
    }

    public void suspend(String username, int days) {
        User user = getUserByUsername(username);
        user.setBannedUntil(java.time.LocalDateTime.now().plusDays(days));
        userRepository.save(user);
    }

    public org.springframework.data.domain.Page<ProfileResponse> searchUsers(String query,
            org.springframework.data.domain.Pageable pageable) {
        return userSearchRepository.findByUsernameContaining(query, pageable)
                .map(doc -> new ProfileResponse(
                        doc.getUsername(),
                        doc.getBio(),
                        doc.getProfileImageUrl(),
                        0L, 0L, 0L, // Counts are not needed for simple search result
                        false, // Privacy unknown from ES doc unless we add it
                        false, // Follow status unknown/irrelevant for simple search list
                        doc.isVerified()));
    }

    public void unsuspend(String username) {
        User user = getUserByUsername(username);
        user.setBannedUntil(null);
        userRepository.save(user);
    }

    @Transactional
    public void verifyUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setVerified(true);
        userRepository.save(user);
        userSyncService.syncUser(user);
        activityLogService.logActivity(user.getId(), user.getUsername(), "VERIFY_USER", "User verified", null);
        System.out.println("VERIFICATION SUCCESS: User " + username + " is now verified.");
    }
}
