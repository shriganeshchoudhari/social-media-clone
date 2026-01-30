package com.example.social.chat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private ChatService chatService;

    @Test
    void shouldReturnUnauthorizedWhenNotLoggedIn() throws Exception {
        mockMvc.perform(get("/api/chat/inbox"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldReturnOkWhenLoggedIn() throws Exception {
        // Stub the service logic
        org.mockito.Mockito.when(chatService.inbox(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(get("/api/chat/inbox"))
                .andExpect(status().isOk());
    }
}
