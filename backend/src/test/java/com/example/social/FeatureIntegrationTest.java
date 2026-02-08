package com.example.social;

import com.example.social.activity.UserActivityLog;
import com.example.social.activity.UserActivityLogRepository;
import com.example.social.search.UserDocument;
import com.example.social.search.UserSearchRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import com.example.social.user.UserService;
import com.example.social.user.dto.ProfileResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class FeatureIntegrationTest {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserActivityLogRepository activityLogRepository;
    @Autowired
    private UserSearchRepository userSearchRepository;

    @Test
    public void testFullFeatureIntegration() throws InterruptedException {
        // 1. Create User (Stored in Postgres)
        String username = "integrationUser";
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword("password");
            user.setEmail("integration@test.com");
            userRepository.save(user);
        }

        // 2. Update Profile -> Should trigger MongoDB Log, Redis Evict, Elastic Sync
        userService.updateProfile(username, "New Bio for Integration Test", null, null);

        // Wait for Async processes (Logs, Elastic Sync)
        Thread.sleep(2000);

        // 3. Verify MongoDB Log
        List<UserActivityLog> logs = activityLogRepository.findByUsername(username);
        assertThat(logs).isNotEmpty();
        assertThat(logs.get(0).getAction()).isEqualTo("UPDATE_PROFILE");

        // 4. Verify Elasticsearch Sync
        List<UserDocument> searchResults = userSearchRepository.findByUsernameContaining(username);
        // Note: ES might take a moment to refresh index, but 2s sleep should be enough
        // for local
        if (searchResults.isEmpty()) {
            // Retry once
            Thread.sleep(2000);
            searchResults = userSearchRepository.findByUsernameContaining(username);
        }
        assertThat(searchResults).isNotEmpty();
        assertThat(searchResults.get(0).getBio()).isEqualTo("New Bio for Integration Test");

        // 5. Verify Caching (Indirectly)
        // First call populates cache
        ProfileResponse p1 = userService.getProfile(username, username);
        // Second call should come from cache (difficult to assert without delving into
        // CacheManager stats,
        // but ensuring it doesn't fail is a good start)
        ProfileResponse p2 = userService.getProfile(username, username);
        assertThat(p1.bio()).isEqualTo(p2.bio());
    }
}
