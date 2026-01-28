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

                // Send notification to receiver
                notificationService.create(
                                receiver,
                                com.example.social.notification.NotificationType.MESSAGE,
                                sender.getId(),
                                sender.getUsername(),
                                sender.getUsername() + " sent you a message");
        }

        public List<MessageResponse> getConversation(String me, String other) {

                User user1 = userRepository.findByUsername(me).orElseThrow();
                User user2 = userRepository.findByUsername(other).orElseThrow();

                // Mark messages as read
                messageRepository.markRead(user1, user2);

                return messageRepository
                                .findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtAsc(
                                                user1, user2,
                                                user1, user2)
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

        public List<com.example.social.chat.dto.ConversationResponse> inbox(String username) {

                User me = userRepository.findByUsername(username).orElseThrow();

                List<Message> messages = messageRepository.findRecentMessages(me);

                java.util.Map<String, Message> latestMap = new java.util.LinkedHashMap<>();

                for (Message m : messages) {

                        String other = m.getSender().equals(me)
                                        ? m.getReceiver().getUsername()
                                        : m.getSender().getUsername();

                        if (!latestMap.containsKey(other)) {
                                latestMap.put(other, m);
                        }
                }

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

                // Send notification to receiver
                notificationService.create(
                                receiver,
                                com.example.social.notification.NotificationType.MESSAGE,
                                sender.getId(),
                                sender.getUsername(),
                                sender.getUsername() + " sent you a message");
        }
}
