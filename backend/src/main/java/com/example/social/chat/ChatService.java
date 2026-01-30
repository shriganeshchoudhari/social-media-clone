package com.example.social.chat;

import com.example.social.chat.dto.MessageResponse;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;
        private final com.example.social.notification.NotificationService notificationService;
        private final com.example.social.file.FileStorageService fileStorageService;
        private final com.example.social.user.BlockRepository blockRepository;
        private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

        @org.springframework.transaction.annotation.Transactional
        public void sendMessage(String senderUsername, String receiverUsername, String content) {

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
                                .build();

                messageRepository.save(message);

                // Send real-time message to receiver
                MessageResponse response = new MessageResponse(
                                message.getId(),
                                sender.getUsername(),
                                receiver.getUsername(),
                                message.getContent(),
                                message.getImageUrl(),
                                message.isRead(),
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
        public List<MessageResponse> getConversation(String me, String other) {

                User user1 = userRepository.findByUsername(me).orElseThrow();
                User user2 = userRepository.findByUsername(other).orElseThrow();

                // Mark messages as read
                messageRepository.markRead(user1, user2);

                return messageRepository
                                .findConversation(user1, user2)
                                .stream()
                                .map(m -> new MessageResponse(
                                                m.getId(),
                                                m.getSender().getUsername(),
                                                m.getReceiver().getUsername(),
                                                m.getContent(),
                                                m.getImageUrl(),
                                                m.isRead(),
                                                m.getCreatedAt()))
                                .toList();
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<com.example.social.chat.dto.ConversationResponse> inbox(String username) {
                System.out.println("Fetching inbox for: " + username);
                User me = userRepository.findByUsername(username).orElseThrow();

                List<Message> messages = messageRepository.findRecentMessages(me);
                System.out.println("Total messages found: " + messages.size());

                java.util.Map<String, Message> latestMap = new java.util.LinkedHashMap<>();

                for (Message m : messages) {
                        String other = m.getSender().getUsername().equals(me.getUsername())
                                        ? m.getReceiver().getUsername()
                                        : m.getSender().getUsername();

                        // System.out.println("Processing message with: " + other);

                        if (!latestMap.containsKey(other)) {
                                latestMap.put(other, m);
                        }
                }

                System.out.println("Unique conversations: " + latestMap.size());

                return latestMap.entrySet().stream()
                                .map(e -> new com.example.social.chat.dto.ConversationResponse(
                                                e.getKey(),
                                                e.getValue().getContent(),
                                                e.getValue().getCreatedAt()))
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
                                receiver.getUsername(),
                                message.getContent(),
                                message.getImageUrl(),
                                message.isRead(),
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
}
