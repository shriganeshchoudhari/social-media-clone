package com.example.social.chat.dto;

public class SocketEvent {
    private SocketEventType type;
    private Object payload;

    public SocketEvent() {
    }

    public SocketEvent(SocketEventType type, Object payload) {
        this.type = type;
        this.payload = payload;
    }

    public SocketEventType getType() {
        return type;
    }

    public void setType(SocketEventType type) {
        this.type = type;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
