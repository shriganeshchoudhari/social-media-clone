package com.example.social.search;

import com.example.social.user.User;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class UserSyncService {

    private final UserSearchRepository userSearchRepository;

    public UserSyncService(UserSearchRepository userSearchRepository) {
        this.userSearchRepository = userSearchRepository;
    }

    @Async
    public void syncUser(User user) {
        UserDocument doc = new UserDocument();
        doc.setId(user.getId().toString()); // Elastic ID
        doc.setUserId(user.getId());
        doc.setUsername(user.getUsername());
        doc.setBio(user.getBio());
        doc.setProfileImageUrl(user.getProfileImageUrl());
        doc.setVerified(user.isVerified());

        userSearchRepository.save(doc);
    }

    // We can call this explicitly from UserService
}
