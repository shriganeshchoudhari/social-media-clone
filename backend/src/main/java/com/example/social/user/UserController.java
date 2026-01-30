package com.example.social.user;

import com.example.social.user.dto.PasswordChangeRequest;
import com.example.social.user.dto.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.example.social.user.UserInterestRepository userInterestRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
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
    public User updateProfile(
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) MultipartFile avatar,
            @RequestParam(required = false) java.util.List<String> interests,
            Authentication auth) {
        return userService.updateProfile(auth.getName(), bio, avatar, interests);
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
    public ProfileResponse getProfile(
            @PathVariable String username,
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
}
