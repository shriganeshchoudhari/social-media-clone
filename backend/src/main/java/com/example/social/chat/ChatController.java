package com.example.social.chat;

import com.example.social.chat.dto.SendMessageRequest;
import com.example.social.chat.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send/{username}")
    public void send(
            @PathVariable String username,
            @RequestBody SendMessageRequest request,
            Authentication auth) {
        chatService.sendMessage(auth.getName(), username, request.content());
    }

    @GetMapping("/conversation/{username}")
    public List<MessageResponse> conversation(
            @PathVariable String username,
            Authentication auth) {
        System.out.println("ChatController: Fetching conversation with " + username);
        try {
            return chatService.getConversation(auth.getName(), username);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/inbox")
    public List<com.example.social.chat.dto.ConversationResponse> inbox(Authentication auth) {
        return chatService.inbox(auth.getName());
    }

    @PostMapping(value = "/send/{username}/image", consumes = "multipart/form-data")
    public void sendWithImage(
            @PathVariable String username,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image,
            Authentication auth) {
        chatService.sendMessageWithImage(auth.getName(), username, content, image);
    }
}
