package com.example.social.chat;

import com.example.social.chat.dto.ChatMessagePayload;
import com.example.social.chat.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(ChatMessagePayload payload, Authentication auth) {

        String sender = auth.getName();
        String receiver = payload.receiver();

        // 1️⃣ Save to DB (this also sends notification)
        chatService.sendMessage(sender, receiver, payload.content());

        // 2️⃣ Push instantly to receiver's private queue
        MessageResponse response = new MessageResponse(
                null,
                sender,
                receiver,
                payload.content(),
                null, // No image in WebSocket messages
                false, // Real-time messages are unread by default
                LocalDateTime.now());

        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/messages",
                response);
    }
}
