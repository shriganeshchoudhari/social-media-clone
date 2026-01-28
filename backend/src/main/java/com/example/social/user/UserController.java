package com.example.social.user;

import com.example.social.user.dto.PasswordChangeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public User me(Authentication auth) {
        return userService.getUserByUsername(auth.getName());
    }

    @PutMapping(value = "/me", consumes = "multipart/form-data")
    public User updateProfile(
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) MultipartFile avatar,
            Authentication auth) {
        return userService.updateProfile(auth.getName(), bio, avatar);
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
}
