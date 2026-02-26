package com.example.social.chat;

import com.example.social.chat.dto.SendMessageRequest;
import com.example.social.chat.dto.MessageResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send/{username}")
    public void send(
            @PathVariable String username,
            @RequestBody SendMessageRequest request,
            Authentication auth) {
        chatService.sendMessage(auth.getName(), username, request.content(), request.voiceUrl());
    }

    @GetMapping("/conversation/{username}")
    public org.springframework.data.domain.Page<MessageResponse> conversation(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        System.out.println("ChatController: Fetching conversation with " + username);
        try {
            return chatService.getConversation(auth.getName(), username, page, size);
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

    @GetMapping("/groups")
    public List<com.example.social.chat.dto.ChatGroupResponse> getMyGroups(Authentication auth) {
        return chatService.getMyGroups(auth.getName());
    }

    @PostMapping("/group/create")
    public com.example.social.chat.dto.ChatGroupResponse createGroup(
            @RequestBody com.example.social.chat.dto.CreateGroupRequest request,
            Authentication auth) {
        return chatService.createGroup(request.name(), request.description(), request.rules(), request.isPublic(),
                auth.getName(), request.participants());
    }

    @GetMapping("/group/search")
    public List<com.example.social.chat.dto.ChatGroupResponse> searchGroups(
            @RequestParam String query,
            Authentication auth) {
        return chatService.searchPublicGroups(query);
    }

    @PostMapping("/group/{groupId}/send")
    public void sendGroupMessage(
            @PathVariable Long groupId,
            @RequestBody com.example.social.chat.dto.GroupMessageRequest request,
            Authentication auth) {
        System.out.println("Received group message request: " + request);
        chatService.sendGroupMessage(groupId, auth.getName(), request.content(), request.voiceUrl());
    }

    @PostMapping("/group/{groupId}/send/image")
    public void sendGroupMessageWithImage(
            @PathVariable Long groupId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image,
            Authentication auth) {
        chatService.sendGroupMessageWithImage(groupId, auth.getName(), content, image);
    }

    @GetMapping("/group/{groupId}/messages")
    public org.springframework.data.domain.Page<MessageResponse> getGroupMessages(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        return chatService.getGroupMessages(groupId, page, size);
    }

    @GetMapping("/group/{groupId}")
    public com.example.social.chat.dto.ChatGroupResponse getGroup(
            @PathVariable Long groupId,
            Authentication auth) {
        return chatService.getGroup(groupId);
    }

    @PostMapping("/message/{messageId}/react")
    public void reactToMessage(
            @PathVariable Long messageId,
            @RequestBody com.example.social.chat.dto.ReactionRequest request,
            Authentication auth) {
        chatService.addReaction(messageId, auth.getName(), request.reaction());
    }

    @PostMapping("/group/{groupId}/add")
    public void addGroupMember(
            @PathVariable Long groupId,
            @RequestParam String username,
            Authentication auth) {
        chatService.addGroupMember(groupId, auth.getName(), username);
    }

    @PostMapping("/group/{groupId}/remove")
    public void removeGroupMember(
            @PathVariable Long groupId,
            @RequestParam String username,
            Authentication auth) {
        chatService.removeGroupMember(groupId, auth.getName(), username);
    }

    @PutMapping("/group/{groupId}")
    public com.example.social.chat.dto.ChatGroupResponse updateGroup(
            @PathVariable Long groupId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String rules,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image,
            Authentication auth) {
        return chatService.updateGroup(groupId, name, description, rules, isPublic, image, auth.getName());
    }

    @PostMapping("/group/{groupId}/leave")
    public void leaveGroup(
            @PathVariable Long groupId,
            Authentication auth) {
        chatService.leaveGroup(groupId, auth.getName());
    }

}
