package com.example.social.user;

import com.example.social.user.dto.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{username}")
    public ProfileResponse getProfile(@PathVariable String username) {
        return profileService.getProfile(username);
    }

    @PutMapping("/me")
    public void updateProfile(
            @RequestParam String bio,
            @RequestParam String imageUrl,
            Authentication authentication) {
        profileService.updateProfile(authentication.getName(), bio, imageUrl);
    }
}
