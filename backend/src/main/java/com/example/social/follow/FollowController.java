package com.example.social.follow;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{username}/follow")
    public void toggleFollow(
            @PathVariable String username,
            Authentication authentication) {
        followService.toggleFollow(authentication.getName(), username);
    }

    @GetMapping("/{username}/following")
    public List<String> getFollowing(@PathVariable String username) {
        return followService.getFollowing(username);
    }

    @GetMapping("/{username}/followers")
    public List<String> getFollowers(@PathVariable String username) {
        return followService.getFollowers(username);
    }
}
