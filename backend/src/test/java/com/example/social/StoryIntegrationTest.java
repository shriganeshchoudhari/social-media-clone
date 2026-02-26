package com.example.social;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import com.example.social.story.Story;
import com.example.social.story.StoryService;
import com.example.social.story.StoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class StoryIntegrationTest {

    @Autowired
    private StoryService storyService;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    // Mock dependencies that might cause context load failure if not
    // present/configured
    @MockBean
    private com.example.social.search.UserSearchRepository userSearchRepository;

    @MockBean
    private com.example.social.activity.UserActivityLogRepository userActivityLogRepository;

    @Test
    public void testInteractiveStories() {
        // 1. Create User
        String username = "storyUserInt";
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword("password");
            newUser.setEmail("storyInt@test.com");
            return userRepository.save(newUser);
        });

        // 2. Create Story with Poll
        MockMultipartFile file = new MockMultipartFile(
                "file", "story.jpg", "image/jpeg", "image content".getBytes());
        List<String> options = List.of("Yes", "No");
        Story story = storyService.createStory(user, file, "Is this cool?", options);

        // 3. Verify Poll Created
        assertThat(story.getPoll()).isNotNull();
        assertThat(story.getPoll().getQuestion()).isEqualTo("Is this cool?");
        assertThat(story.getPoll().getOptions()).hasSize(2);

        // 4. Vote
        Long optionId = story.getPoll().getOptions().get(0).getId();
        storyService.voteStoryPoll(story.getId(), optionId, username);

        // 5. Verify Vote Count
        Story updatedStory = storyRepository.findById(story.getId()).orElseThrow();
        assertThat(updatedStory.getPoll().getOptions().get(0).getVoteCount()).isEqualTo(1);

        // 6. Verify User Vote Status
        Long votedOption = storyService.getUserVoteForStory(story.getId(), username);
        assertThat(votedOption).isEqualTo(optionId);
    }
}
