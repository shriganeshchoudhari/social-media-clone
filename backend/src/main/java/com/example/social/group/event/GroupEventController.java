package com.example.social.group.event;

import com.example.social.group.event.dto.GroupEventRequest;
import com.example.social.group.event.dto.GroupEventResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupEventController {

    private final GroupEventService groupEventService;

    public GroupEventController(GroupEventService groupEventService) {
        this.groupEventService = groupEventService;
    }

    @PostMapping("/{id}/events")
    public GroupEventResponse createEvent(@PathVariable Long id, @RequestBody GroupEventRequest request,
            Authentication auth) {
        return groupEventService.createEvent(id, auth.getName(), request);
    }

    @GetMapping("/{id}/events")
    public List<GroupEventResponse> getEvents(@PathVariable Long id, Authentication auth) {
        return groupEventService.getGroupEvents(id, auth.getName());
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(@PathVariable Long eventId, Authentication auth) {
        groupEventService.deleteEvent(eventId, auth.getName());
    }
}
