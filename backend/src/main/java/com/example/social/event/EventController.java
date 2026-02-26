package com.example.social.event;

import com.example.social.chat.ChatGroup;
import com.example.social.chat.ChatGroupRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final UserRepository userRepository;

    public EventController(EventRepository eventRepository, ChatGroupRepository chatGroupRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.chatGroupRepository = chatGroupRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Event createEvent(@RequestBody EventRequest request, Authentication authentication) {
        User creator = userRepository.findByUsername(authentication.getName()).orElseThrow();
        ChatGroup group = chatGroupRepository.findById(request.groupId()).orElseThrow();

        if (!group.getParticipants().contains(creator)) {
            throw new RuntimeException("You must be a member of the group to create events");
        }

        Event event = new Event(
                request.title(),
                request.description(),
                request.startTime(),
                request.endTime(),
                request.location(),
                group,
                creator);

        return eventRepository.save(event);
    }

    @GetMapping("/group/{groupId}")
    public Page<EventResponse> getGroupEvents(@PathVariable Long groupId, Pageable pageable) {
        ChatGroup group = chatGroupRepository.findById(groupId).orElseThrow();
        return eventRepository.findByChatGroup(group, pageable)
                .map(this::toResponse);
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<Void> joinEvent(@PathVariable Long eventId, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Event event = eventRepository.findById(eventId).orElseThrow();

        if (!event.getChatGroup().getParticipants().contains(user)) {
            throw new RuntimeException("You must be a member of the group to join this event");
        }

        event.getParticipants().add(user);
        eventRepository.save(event);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/leave")
    public ResponseEntity<Void> leaveEvent(@PathVariable Long eventId, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Event event = eventRepository.findById(eventId).orElseThrow();

        event.getParticipants().remove(user);
        eventRepository.save(event);
        return ResponseEntity.ok().build();
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getCreator().getUsername(),
                event.getParticipants().size(),
                event.getParticipants().stream().map(User::getUsername).collect(Collectors.toList()));
    }

    public record EventRequest(String title, String description, LocalDateTime startTime, LocalDateTime endTime,
            String location, Long groupId) {
    }

    public record EventResponse(Long id, String title, String description, LocalDateTime startTime,
            LocalDateTime endTime, String location, String creator, int participantCount, List<String> participants) {
    }
}
