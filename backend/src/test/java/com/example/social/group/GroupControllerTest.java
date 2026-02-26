package com.example.social.group;

import com.example.social.group.dto.GroupRequest;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        if (userRepository.findByUsername("testuser").isEmpty()) {
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("test@example.com");
            user.setPassword("password");
            userRepository.save(user);
        }
    }

    @Test
    @WithMockUser(username = "testuser")
    void createGroup_ShouldReturn200() throws Exception {
        GroupRequest request = new GroupRequest("Test Group", "Description", "Standard Rules", "PUBLIC");

        mockMvc.perform(post("/api/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
