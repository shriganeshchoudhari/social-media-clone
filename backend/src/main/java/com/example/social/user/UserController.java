package com.example.social.user;

import com.example.social.user.dto.PasswordChangeRequest;
import com.example.social.user.dto.ProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and account management endpoints")
public class UserController {

    private final UserService userService;
    private final com.example.social.user.UserInterestRepository userInterestRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Retrieve authenticated user's information")
    public com.example.social.user.User me(Authentication auth) {
        return userService.getUserByUsername(auth.getName());
    }

    @GetMapping("/me/interests")
    public java.util.List<String> getMyInterests(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userInterestRepository.findTagsByUser(user);
    }

    @PostMapping("/me/interests")
    public void saveInterest(Authentication auth, @RequestParam String tag) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.example.social.user.UserInterest interest = new com.example.social.user.UserInterest();
        interest.setUser(user);
        interest.setTag(tag);
        userInterestRepository.save(interest);
    }

    @PutMapping(value = "/me", consumes = "multipart/form-data")
    @Operation(summary = "Update profile", description = "Update user profile with bio, avatar, and interests")
    public User updateProfile(
            @Parameter(description = "User bio") @RequestParam(required = false) String bio,
            @Parameter(description = "Profile avatar image") @RequestParam(required = false) MultipartFile avatar,
            @Parameter(description = "Profile banner image") @RequestParam(required = false) MultipartFile banner,
            @Parameter(description = "User website URL") @RequestParam(required = false) String website,
            @Parameter(description = "User interests/tags") @RequestParam(required = false) java.util.List<String> interests,
            Authentication auth) {
        return userService.updateProfile(auth.getName(), bio, avatar, banner, website, interests);
    }

    @PostMapping("/me/change-password")
    public void changePassword(
            @RequestBody PasswordChangeRequest request,
            Authentication auth) {
        userService.changePassword(
                auth.getName(),
                request.oldPassword(),
                request.newPassword());
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get user profile", description = "Retrieve public profile information for a specific user")
    public ProfileResponse getProfile(
            @Parameter(description = "Username to retrieve") @PathVariable String username,
            Authentication auth) {
        return userService.getProfile(auth.getName(), username);
    }

    @PostMapping("/me/privacy")
    public User togglePrivacy(Authentication auth) {
        return userService.togglePrivacy(auth.getName());
    }

    @DeleteMapping("/me")
    public void deleteAccount(Authentication auth) {
        userService.deleteAccount(auth.getName());
    }

    @PostMapping("/{username}/block")
    public void block(@PathVariable String username, Authentication auth) {
        userService.toggleBlock(auth.getName(), username);
    }

    @PostMapping("/{username}/verify")
    public void verifyUser(@PathVariable String username) {
        userService.verifyUser(username);
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username")
    public java.util.List<com.example.social.user.dto.UserSearchResponse> search(
            @Parameter(description = "Search query") @RequestParam String q) {
        return userService.searchUsers(q);
    }
}
