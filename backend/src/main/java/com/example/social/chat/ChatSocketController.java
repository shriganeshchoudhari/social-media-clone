package com.example.social.chat;

import com.example.social.chat.dto.ChatMessagePayload;
import com.example.social.chat.dto.TypingPayload;
import com.example.social.chat.dto.ReadPayload;

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
        chatService.sendMessage(sender, receiver, payload.content());
    }

    @MessageMapping("/chat.typing")
    public void typing(TypingPayload payload, Authentication auth) {
        String sender = auth.getName();
        chatService.sendTyping(sender, payload.receiver());
    }

    @MessageMapping("/chat.read")
    public void read(ReadPayload payload, Authentication auth) {
        String reader = auth.getName();
        // payload.receiver() is the original sender of the message who needs to know it
        // was read
        chatService.sendReadReceipt(reader, payload.receiver(), payload.messageId());
    }
}
