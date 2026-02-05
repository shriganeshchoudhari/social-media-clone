package com.example.social.group.event;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupEventController {

    private final GroupEventService groupEventService;

    @PostMapping("/{id}/events")
    public GroupEventResponse createEvent(@PathVariable Long id, @RequestBody EventRequest request,
            Authentication auth) {
        return groupEventService.createEvent(id, auth.getName(), request.title, request.description, request.startTime,
                request.location);
    }

    @GetMapping("/{id}/events")
    public List<GroupEventResponse> getEvents(@PathVariable Long id, Authentication auth) {
        return groupEventService.getGroupEvents(id, auth.getName());
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(@PathVariable Long eventId, Authentication auth) {
        groupEventService.deleteEvent(eventId, auth.getName());
    }

    @Data
    public static class EventRequest {
        private String title;
        private String description;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime startTime;
        private String location;
    }
}
