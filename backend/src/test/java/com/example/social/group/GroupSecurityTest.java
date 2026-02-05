package com.example.social.group;

import com.example.social.group.dto.GroupRequest;
import com.example.social.group.dto.GroupResponse;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class GroupSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        createUser("owner");
        createUser("joiner");
        createUser("invitee");
    }

    private void createUser(String username) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPassword("password");
            userRepository.save(user);
        }
    }

    @Test
    void testPrivateGroupSecurityFlow() throws Exception {
        // 1. Owner creates Private Group
        GroupRequest createRequest = new GroupRequest("Private Club", "Secret", "PRIVATE");
        MvcResult createResult = mockMvc.perform(post("/api/groups")
                .with(user("owner"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn();

        GroupResponse group = objectMapper.readValue(createResult.getResponse().getContentAsString(),
                GroupResponse.class);
        Long groupId = group.id();

        // 2. Joiner tries to join directly (Should Fail 403)
        mockMvc.perform(post("/api/groups/" + groupId + "/join")
                .with(user("joiner")))
                .andExpect(status().isForbidden());

        // 3. Owner invites Joiner
        mockMvc.perform(post("/api/groups/invitations/invite")
                .with(user("owner"))
                .param("groupId", groupId.toString())
                .param("username", "joiner"))
                .andExpect(status().isOk());

        // 4. Joiner checks invitations
        MvcResult invitesResult = mockMvc.perform(get("/api/groups/invitations/my")
                .with(user("joiner")))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode invites = objectMapper.readTree(invitesResult.getResponse().getContentAsString());
        if (invites.isArray() && invites.size() > 0) {
            Long invitationId = invites.get(0).get("id").asLong();

            // 5. Joiner accepts invitation
            mockMvc.perform(post("/api/groups/invitations/" + invitationId + "/accept")
                    .with(user("joiner")))
                    .andExpect(status().isOk());

            // 6. Verify Joiner is now a member by trying to join again (Should be Bad
            // Request "Already a member" not Forbidden)
            mockMvc.perform(post("/api/groups/" + groupId + "/join")
                    .with(user("joiner")))
                    .andExpect(status().isBadRequest());
        } else {
            // Fallback if invite not returned (should not happen if logic works)
            throw new RuntimeException("Invitation not found for joiner");
        }
    }
}
