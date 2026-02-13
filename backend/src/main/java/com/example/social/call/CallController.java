package com.example.social.call;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class CallController {

    private final SimpMessagingTemplate messagingTemplate;

    public CallController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/call/signal")
    public void handleSignal(@Payload CallSignal signal, Principal principal) {
        String senderUsername = principal.getName();

        System.out.println(
                "Call Signal: " + signal.type() + " from " + senderUsername + " to " + signal.targetUsername());

        // Forward signal to target user
        // We inject the senderUsername so the receiver knows who is calling
        CallSignal forwardSignal = new CallSignal(
                signal.type(),
                senderUsername,
                signal.targetUsername(),
                signal.sdp(),
                signal.candidate());

        messagingTemplate.convertAndSendToUser(
                signal.targetUsername(),
                "/queue/call",
                forwardSignal);
    }
}
