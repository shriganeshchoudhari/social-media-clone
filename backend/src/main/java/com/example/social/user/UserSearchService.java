package com.example.social.user;

import com.example.social.user.dto.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserSearchService {

    private final UserRepository userRepository;

    public Page<UserSearchResponse> searchUsers(String query, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return userRepository
                .findByUsernameContainingIgnoreCase(query, pageable)
                .map(user -> new UserSearchResponse(
                        user.getUsername(),
                        user.getBio(),
                        user.getProfileImageUrl()));
    }
}
