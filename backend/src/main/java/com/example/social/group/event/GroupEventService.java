package com.example.social.group.event;

import com.example.social.group.Group;
import com.example.social.group.GroupRepository;
import com.example.social.group.GroupMemberRepository;
import com.example.social.group.GroupMember;
import com.example.social.user.User;
import com.example.social.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupEventService {

    private final GroupEventRepository groupEventRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserService userService;

    public GroupEventService(
            GroupEventRepository groupEventRepository,
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            UserService userService) {
        this.groupEventRepository = groupEventRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userService = userService;
    }

    @Transactional
    public GroupEventResponse createEvent(Long groupId, String username, String title, String description,
            LocalDateTime startTime, String location) {
        User user = userService.getUserByUsername(username);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member");
        }

        GroupEvent event = GroupEvent.builder()
                .group(group)
                .organizer(user)
                .title(title)
                .description(description)
                .startTime(startTime)
                .location(location)
                .build();

        GroupEvent saved = groupEventRepository.save(event);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GroupEventResponse> getGroupEvents(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (group.getPrivacy() == Group.GroupPrivacy.PRIVATE
                && !groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private group");
        }

        return groupEventRepository.findByGroupOrderByStartTimeAsc(group).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private GroupEventResponse mapToResponse(GroupEvent event) {
        return GroupEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .location(event.getLocation())
                .organizerUsername(event.getOrganizer().getUsername())
                .organizerId(event.getOrganizer().getId())
                .createdAt(event.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteEvent(Long eventId, String username) {
        User user = userService.getUserByUsername(username);
        GroupEvent event = groupEventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizer().equals(user)) {
            // Allow Group Admin to delete too
            boolean isAdmin = groupMemberRepository.findByGroupAndUser(event.getGroup(), user)
                    .map(m -> m.getRole() == GroupMember.GroupRole.ADMIN)
                    .orElse(false);

            if (!isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
            }
        }

        groupEventRepository.delete(event);
    }
}
