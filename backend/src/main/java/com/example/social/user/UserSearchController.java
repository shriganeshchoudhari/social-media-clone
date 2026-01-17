package com.example.social.user;

import com.example.social.user.dto.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping("/search")
    public Page<UserSearchResponse> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userSearchService.searchUsers(q, page, size);
    }
}
