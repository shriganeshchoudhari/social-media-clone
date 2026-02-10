package com.example.social.chat;

import com.example.social.chat.dto.MessageResponse;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;
        private final ChatGroupRepository chatGroupRepository;
        private final MessageReactionRepository messageReactionRepository;
        private final com.example.social.notification.NotificationService notificationService;
        private final com.example.social.file.FileStorageService fileStorageService;
        private final com.example.social.user.BlockRepository blockRepository;
        private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

        public ChatService(
                        MessageRepository messageRepository,
                        UserRepository userRepository,
                        ChatGroupRepository chatGroupRepository,
                        MessageReactionRepository messageReactionRepository,
                        com.example.social.notification.NotificationService notificationService,
                        com.example.social.file.FileStorageService fileStorageService,
                        com.example.social.user.BlockRepository blockRepository,
                        org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
                this.messageRepository = messageRepository;
                this.userRepository = userRepository;
                this.chatGroupRepository = chatGroupRepository;
                this.messageReactionRepository = messageReactionRepository;
                this.notificationService = notificationService;
                this.fileStorageService = fileStorageService;
                this.blockRepository = blockRepository;
                this.messagingTemplate = messagingTemplate;
        }

        @org.springframework.transaction.annotation.Transactional
        public void sendMessage(String senderUsername, String receiverUsername, String content, String voiceUrl) {

                User sender = userRepository.findByUsername(senderUsername).orElseThrow();
                User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();

                if (blockRepository.existsByBlockerAndBlocked(receiver, sender)) {
                        throw new RuntimeException("You are blocked");
                }
                if (blockRepository.existsByBlockerAndBlocked(sender, receiver)) {
                        throw new RuntimeException("You have blocked this user");
                }

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content)
                                .voiceUrl(voiceUrl)
                                .build();

                messageRepository.save(message);

                // Send real-time message to receiver
                MessageResponse response = new MessageResponse(
                                message.getId(),
                                sender.getUsername(),
                                sender.getProfileImageUrl(),
                                receiver.getUsername(),
                                null, // groupId
                                message.getContent(),
                                message.getImageUrl(),
                                message.getVoiceUrl(),
                                message.isRead(),
                                new java.util.ArrayList<>(), // reactions
                                message.getCreatedAt());

                messagingTemplate.convertAndSendToUser(
                                receiverUsername,
                                "/queue/messages",
                                response);

                // Also send back to sender (for confirmation/synced across devices)
                /*
                 * messagingTemplate.convertAndSendToUser(
                 * senderUsername,
                 * "/queue/messages",
                 * response);
                 */

                // Send notification to receiver
                notificationService.create(
                                receiver,
                                com.example.social.notification.NotificationType.MESSAGE,
                                sender.getId(),
                                sender.getUsername(),
                                sender.getUsername() + " sent you a message");
        }

        @org.springframework.transaction.annotation.Transactional
        public org.springframework.data.domain.Page<MessageResponse> getConversation(String me, String other, int page,
                        int size) {

                User user1 = userRepository.findByUsername(me).orElseThrow();
                User user2 = userRepository.findByUsername(other).orElseThrow();

                // Mark messages as read
                messageRepository.markRead(user1, user2);

                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);

                return messageRepository
                                .findConversation(user1, user2, pageable)
                                .map(m -> new MessageResponse(
                                                m.getId(),
                                                m.getSender().getUsername(),
                                                m.getSender().getProfileImageUrl(),
                                                m.getReceiver().getUsername(),
                                                m.getChatGroup() != null ? m.getChatGroup().getId() : null,
                                                m.getContent(),
                                                m.getImageUrl(),
                                                m.getVoiceUrl(),
                                                m.isRead(),
                                                m.getReactions().stream()
                                                                .map(r -> new com.example.social.chat.dto.ReactionResponse(
                                                                                r.getId(),
                                                                                r.getUser().getUsername(),
                                                                                r.getReaction()))
                                                                .toList(),
                                                m.getCreatedAt()));
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<com.example.social.chat.dto.ConversationResponse> inbox(String username) {
                System.out.println("Fetching inbox for: " + username);
                User me = userRepository.findByUsername(username).orElseThrow();

                List<Message> messages = messageRepository.findRecentMessages(me);
                System.out.println("Total messages found: " + messages.size());

                java.util.Map<String, Message> latestMap = new java.util.LinkedHashMap<>();

                for (Message m : messages) {
                        if (m.getChatGroup() != null)
                                continue;

                        String otherUsername = m.getSender().getUsername().equals(me.getUsername())
                                        ? m.getReceiver().getUsername()
                                        : m.getSender().getUsername();

                        if (!latestMap.containsKey(otherUsername)) {
                                latestMap.put(otherUsername, m);
                        }
                }

                System.out.println("Unique conversations: " + latestMap.size());

                return latestMap.entrySet().stream()
                                .map(e -> {
                                        Message m = e.getValue();
                                        User otherUser = m.getSender().getUsername().equals(me.getUsername())
                                                        ? m.getReceiver()
                                                        : m.getSender();

                                        return new com.example.social.chat.dto.ConversationResponse(
                                                        e.getKey(),
                                                        m.getContent(),
                                                        m.getCreatedAt(),
                                                        otherUser.getProfileImageUrl(),
                                                        otherUser.isVerified());
                                })
                                .toList();
        }

        public void sendMessageWithImage(String senderUsername, String receiverUsername,
                        String content, org.springframework.web.multipart.MultipartFile image) {

                User sender = userRepository.findByUsername(senderUsername).orElseThrow();
                User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();

                String imageUrl = null;
                if (image != null && !image.isEmpty()) {
                        imageUrl = fileStorageService.storeFile(image);
                }

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content != null ? content : "")
                                .imageUrl(imageUrl)
                                .build();

                messageRepository.save(message);

                // Send real-time message to receiver
                MessageResponse response = new MessageResponse(
                                message.getId(),
                                sender.getUsername(),
                                sender.getProfileImageUrl(),
                                receiver.getUsername(),
                                null,
                                message.getContent(),
                                message.getImageUrl(),
                                message.getVoiceUrl(),
                                message.isRead(),
                                new java.util.ArrayList<>(),
                                message.getCreatedAt());

                messagingTemplate.convertAndSendToUser(
                                receiverUsername,
                                "/queue/messages",
                                response);

                // Send notification to receiver
                notificationService.create(
                                receiver,
                                com.example.social.notification.NotificationType.MESSAGE,
                                sender.getId(),
                                sender.getUsername(),
                                sender.getUsername() + " sent you a message");
        }

        public void sendTyping(String senderUsername, String receiverUsername) {
                messagingTemplate.convertAndSendToUser(
                                receiverUsername,
                                "/queue/events",
                                new com.example.social.chat.dto.SocketEvent(
                                                com.example.social.chat.dto.SocketEventType.TYPING,
                                                new com.example.social.chat.dto.TypingPayload(senderUsername) // Sender
                                                                                                              // is the
                                                                                                              // one
                                                                                                              // typing
                                ));
        }

        @org.springframework.transaction.annotation.Transactional
        public void sendReadReceipt(String readerUsername, String originalSenderUsername, Long messageId) {
                // Update DB
                // We can optimize this to mark everything before this ID as read, but for now
                // simple update
                // Ideally we'd have a method markMessagesAsRead(reader, sender)
                User reader = userRepository.findByUsername(readerUsername).orElseThrow();
                User originalSender = userRepository.findByUsername(originalSenderUsername).orElseThrow();
                messageRepository.markRead(reader, originalSender);

                // Broadcast event
                messagingTemplate.convertAndSendToUser(
                                originalSenderUsername,
                                "/queue/events",
                                new com.example.social.chat.dto.SocketEvent(
                                                com.example.social.chat.dto.SocketEventType.READ,
                                                new com.example.social.chat.dto.ReadPayload(readerUsername,
                                                                messageId)));
        }

        // Group Chat Methods

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<com.example.social.chat.dto.ChatGroupResponse> getMyGroups(String username) {
                User user = userRepository.findByUsername(username).orElseThrow();
                return chatGroupRepository.findByParticipant(user)
                                .stream()
                                .map(this::toDto)
                                .toList();
        }

        @org.springframework.transaction.annotation.Transactional
        public com.example.social.chat.dto.ChatGroupResponse createGroup(String name, String creatorUsername,
                        List<String> participantUsernames) {
                User creator = userRepository.findByUsername(creatorUsername).orElseThrow();
                ChatGroup group = new ChatGroup(name, creator);

                for (String username : participantUsernames) {
                        userRepository.findByUsername(username).ifPresent(group.getParticipants()::add);
                }

                ChatGroup saved = chatGroupRepository.save(group);
                return toDto(saved);
        }

        private com.example.social.chat.dto.ChatGroupResponse toDto(ChatGroup group) {
                return new com.example.social.chat.dto.ChatGroupResponse(
                                group.getId(),
                                group.getName(),
                                group.getImageUrl(),
                                group.getCreatedAt(),
                                group.getParticipants().stream()
                                                .map(p -> new com.example.social.chat.dto.GroupParticipantDto(
                                                                p.getId(),
                                                                p.getUsername(),
                                                                p.getProfileImageUrl(),
                                                                p.isVerified()))
                                                .collect(java.util.stream.Collectors.toSet()),
                                group.getAdmins().stream()
                                                .map(a -> new com.example.social.chat.dto.GroupParticipantDto(
                                                                a.getId(),
                                                                a.getUsername(),
                                                                a.getProfileImageUrl(),
                                                                a.isVerified()))
                                                .collect(java.util.stream.Collectors.toSet()),
                                group.getCreator().getId(),
                                group.getCreator().getUsername());
        }

        @org.springframework.transaction.annotation.Transactional
        public void sendGroupMessage(Long groupId, String senderUsername, String content, String voiceUrl) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User sender = userRepository.findByUsername(senderUsername).orElseThrow();

                if (!group.getParticipants().contains(sender)) {
                        throw new RuntimeException("You are not a member of this group");
                }

                Message message = Message.builder()
                                .sender(sender)
                                .chatGroup(group)
                                .content(content)
                                .voiceUrl(voiceUrl)
                                .isRead(false) // Read status in groups is complex, keeping false for now
                                .build();

                messageRepository.save(message);

                MessageResponse response = new MessageResponse(
                                message.getId(),
                                sender.getUsername(),
                                sender.getProfileImageUrl(),
                                null, // no receiver user
                                group.getId(),
                                message.getContent(),
                                message.getImageUrl(),
                                message.getVoiceUrl(),
                                message.isRead(),
                                new java.util.ArrayList<>(),
                                message.getCreatedAt());

                // Broadcast to all participants except sender
                for (User participant : group.getParticipants()) {
                        if (!participant.equals(sender)) {
                                messagingTemplate.convertAndSendToUser(
                                                participant.getUsername(),
                                                "/queue/messages",
                                                response);
                        }
                }
        }

        @org.springframework.transaction.annotation.Transactional
        public void sendGroupMessageWithImage(Long groupId, String senderUsername, String content,
                        org.springframework.web.multipart.MultipartFile image) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User sender = userRepository.findByUsername(senderUsername).orElseThrow();

                if (!group.getParticipants().contains(sender)) {
                        throw new RuntimeException("You are not a member of this group");
                }

                String imageUrl = null;
                if (image != null && !image.isEmpty()) {
                        imageUrl = fileStorageService.storeFile(image);
                }

                Message message = Message.builder()
                                .sender(sender)
                                .chatGroup(group)
                                .content(content != null ? content : "")
                                .imageUrl(imageUrl)
                                .isRead(false)
                                .build();

                messageRepository.save(message);

                MessageResponse response = new MessageResponse(
                                message.getId(),
                                sender.getUsername(),
                                sender.getProfileImageUrl(),
                                null,
                                group.getId(),
                                message.getContent(),
                                message.getImageUrl(),
                                message.getVoiceUrl(),
                                message.isRead(),
                                new java.util.ArrayList<>(),
                                message.getCreatedAt());

                for (User participant : group.getParticipants()) {
                        if (!participant.equals(sender)) {
                                messagingTemplate.convertAndSendToUser(
                                                participant.getUsername(),
                                                "/queue/messages",
                                                response);
                        }
                }
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public org.springframework.data.domain.Page<MessageResponse> getGroupMessages(Long groupId, int page,
                        int size) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);

                return messageRepository.findByChatGroup(group, pageable)
                                .map(m -> new MessageResponse(
                                                m.getId(),
                                                m.getSender().getUsername(),
                                                m.getSender().getProfileImageUrl(),
                                                null,
                                                m.getChatGroup().getId(),
                                                m.getContent(),
                                                m.getImageUrl(),
                                                m.getVoiceUrl(),
                                                m.isRead(),
                                                m.getReactions().stream()
                                                                .map(r -> new com.example.social.chat.dto.ReactionResponse(
                                                                                r.getId(),
                                                                                r.getUser().getUsername(),
                                                                                r.getReaction()))
                                                                .toList(),
                                                m.getCreatedAt()));
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public com.example.social.chat.dto.ChatGroupResponse getGroup(Long groupId) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                return toDto(group);
        }

        // Reaction Methods

        @org.springframework.transaction.annotation.Transactional
        public void addReaction(Long messageId, String username, String reactionType) {
                Message message = messageRepository.findById(messageId).orElseThrow();
                User user = userRepository.findByUsername(username).orElseThrow();

                // Check if already reacted
                java.util.Optional<MessageReaction> existing = messageReactionRepository.findByMessageAndUser(message,
                                user);
                if (existing.isPresent()) {
                        existing.get().setReaction(reactionType);
                        messageReactionRepository.save(existing.get());
                } else {
                        MessageReaction reaction = new MessageReaction(message, user, reactionType);
                        messageReactionRepository.save(reaction);
                }

                // Notify sender/group
                // For simplicity, just notifying the message sender if 1-on-1, or all for
                // group?
                // Ideally broadcase update event to everyone who has the message loaded
        }

        // Member Management
        @org.springframework.transaction.annotation.Transactional
        public void addGroupMember(Long groupId, String adderUsername, String newMemberUsername) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User adder = userRepository.findByUsername(adderUsername).orElseThrow();

                if (!group.getAdmins().contains(adder) && !group.getCreator().equals(adder)) {
                        throw new RuntimeException("Only admins can add members");
                }

                User newMember = userRepository.findByUsername(newMemberUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                group.getParticipants().add(newMember);
                chatGroupRepository.save(group);

                notificationService.create(newMember,
                                com.example.social.notification.NotificationType.MESSAGE,
                                group.getId(),
                                group.getName(),
                                "You were added to group " + group.getName());
        }

        @org.springframework.transaction.annotation.Transactional
        public void removeGroupMember(Long groupId, String removerUsername, String memberToRemoveUsername) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User remover = userRepository.findByUsername(removerUsername).orElseThrow();
                User memberToRemove = userRepository.findByUsername(memberToRemoveUsername).orElseThrow();

                if (!group.getAdmins().contains(remover) && !group.getCreator().equals(remover)) {
                        throw new RuntimeException("Only admins can remove members");
                }

                group.getParticipants().remove(memberToRemove);
                group.getAdmins().remove(memberToRemove);

                chatGroupRepository.save(group);
        }

        @org.springframework.transaction.annotation.Transactional
        public void leaveGroup(Long groupId, String username) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User user = userRepository.findByUsername(username).orElseThrow();

                if (!group.getParticipants().contains(user)) {
                        throw new RuntimeException("You are not in this group");
                }

                group.getParticipants().remove(user);
                group.getAdmins().remove(user);

                if (group.getParticipants().isEmpty()) {
                        chatGroupRepository.delete(group);
                } else {
                        chatGroupRepository.save(group);
                }
        }

        @org.springframework.transaction.annotation.Transactional
        public com.example.social.chat.dto.ChatGroupResponse updateGroup(Long groupId, String name,
                        org.springframework.web.multipart.MultipartFile image, String username) {
                ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
                User user = userRepository.findByUsername(username).orElseThrow();

                if (!group.getAdmins().contains(user) && !group.getCreator().equals(user)) {
                        throw new RuntimeException("Only admins can update group details");
                }

                if (name != null && !name.isBlank()) {
                        group.setName(name);
                }

                if (image != null && !image.isEmpty()) {
                        try {
                                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
                                if (!java.nio.file.Files.exists(uploadPath)) {
                                        java.nio.file.Files.createDirectories(uploadPath);
                                }
                                java.nio.file.Files.copy(image.getInputStream(), uploadPath.resolve(filename),
                                                java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                                group.setImageUrl("/uploads/" + filename);
                        } catch (java.io.IOException e) {
                                throw new RuntimeException("Failed to upload image", e);
                        }
                }

                ChatGroup saved = chatGroupRepository.save(group);
                return toDto(saved);
        }
}
