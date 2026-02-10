package com.example.social.chat;

import com.example.social.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = true)
    private User receiver;

    @Column(nullable = false)
    private String content;

    private String imageUrl;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_group_id")
    private ChatGroup chatGroup;

    private String voiceUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<MessageReaction> reactions = new java.util.ArrayList<>();

    public Message() {
    }

    public Message(Long id, User sender, User receiver, String content, String imageUrl, boolean isRead,
            LocalDateTime createdAt, ChatGroup chatGroup, String voiceUrl, Message replyTo) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.imageUrl = imageUrl;
        this.isRead = isRead;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.chatGroup = chatGroup;
        this.voiceUrl = voiceUrl;
        this.replyTo = replyTo;
    }

    // Getters and Setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ChatGroup getChatGroup() {
        return chatGroup;
    }

    public void setChatGroup(ChatGroup chatGroup) {
        this.chatGroup = chatGroup;
    }

    public String getVoiceUrl() {
        return voiceUrl;
    }

    public void setVoiceUrl(String voiceUrl) {
        this.voiceUrl = voiceUrl;
    }

    public Message getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(Message replyTo) {
        this.replyTo = replyTo;
    }

    public java.util.List<MessageReaction> getReactions() {
        return reactions;
    }

    public void setReactions(java.util.List<MessageReaction> reactions) {
        this.reactions = reactions;
    }

    // Builder
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public static class MessageBuilder {
        private Long id;
        private User sender;
        private User receiver;
        private String content;
        private String imageUrl;
        private boolean isRead = false;
        private LocalDateTime createdAt = LocalDateTime.now(); // Default to now
        private ChatGroup chatGroup;
        private String voiceUrl;
        private Message replyTo;

        public MessageBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MessageBuilder sender(User sender) {
            this.sender = sender;
            return this;
        }

        public MessageBuilder receiver(User receiver) {
            this.receiver = receiver;
            return this;
        }

        public MessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public MessageBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public MessageBuilder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public MessageBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public MessageBuilder chatGroup(ChatGroup chatGroup) {
            this.chatGroup = chatGroup;
            return this;
        }

        public MessageBuilder voiceUrl(String voiceUrl) {
            this.voiceUrl = voiceUrl;
            return this;
        }

        public MessageBuilder replyTo(Message replyTo) {
            this.replyTo = replyTo;
            return this;
        }

        public Message build() {
            return new Message(id, sender, receiver, content, imageUrl, isRead, createdAt, chatGroup, voiceUrl,
                    replyTo);
        }
    }
}
