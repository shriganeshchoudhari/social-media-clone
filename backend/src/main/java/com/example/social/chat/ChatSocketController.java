package com.example.social.chat;

import com.example.social.chat.dto.ChatMessagePayload;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void send(ChatMessagePayload payload, Authentication auth) {

        String sender = auth.getName();
        String receiver = payload.receiver();

        // Delegate to service (which saves & broadcasts)
        chatService.sendMessage(sender, receiver, payload.content());
    }
}
