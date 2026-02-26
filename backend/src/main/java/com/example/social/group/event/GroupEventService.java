package com.example.social.group.event;

import com.example.social.group.Group;
import com.example.social.group.GroupMember;
import com.example.social.group.GroupMemberRepository;
import com.example.social.group.GroupRepository;
import com.example.social.group.event.dto.GroupEventRequest;
import com.example.social.group.event.dto.GroupEventResponse;
import com.example.social.user.User;
import com.example.social.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupEventService {

        private final GroupEventRepository groupEventRepository;
        private final GroupRepository groupRepository;
        private final UserService userService;
        private final GroupMemberRepository groupMemberRepository;

        public GroupEventService(GroupEventRepository groupEventRepository, GroupRepository groupRepository,
                        UserService userService, GroupMemberRepository groupMemberRepository) {
                this.groupEventRepository = groupEventRepository;
                this.groupRepository = groupRepository;
                this.userService = userService;
                this.groupMemberRepository = groupMemberRepository;
        }

        @Transactional
        public GroupEventResponse createEvent(Long groupId, String username, GroupEventRequest request) {
                User user = userService.getUserByUsername(username);
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Group not found"));

                // Check if member
                GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));

                // Optional: Check if admin/moderator
                if (member.getRole() != GroupMember.GroupRole.ADMIN
                                && member.getRole() != GroupMember.GroupRole.MODERATOR) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "Only Admins/Moderators can create events");
                }

                GroupEvent event = GroupEvent.builder()
                                .group(group)
                                .organizer(user)
                                .title(request.title())
                                .description(request.description())
                                .startTime(request.startTime())
                                .endTime(request.endTime())
                                .location(request.location())
                                .build();

                GroupEvent saved = groupEventRepository.save(event);
                return mapToResponse(saved);
        }

        @Transactional(readOnly = true)
        public List<GroupEventResponse> getGroupEvents(Long groupId, String username) {
                User user = userService.getUserByUsername(username);
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Group not found"));

                if (group.getPrivacy() == Group.GroupPrivacy.PRIVATE
                                && !groupMemberRepository.existsByGroupAndUser(group, user)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private group");
                }

                return groupEventRepository.findByGroupOrderByStartTimeAsc(group).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private GroupEventResponse mapToResponse(GroupEvent event) {
                return new GroupEventResponse(
                                event.getId(),
                                event.getTitle(),
                                event.getDescription(),
                                event.getStartTime(),
                                event.getEndTime(),
                                event.getLocation(),
                                event.getOrganizer().getUsername(),
                                event.getOrganizer().getId(),
                                event.getCreatedAt());
        }

        @Transactional
        public void deleteEvent(Long eventId, String username) {
                User user = userService.getUserByUsername(username);
                GroupEvent event = groupEventRepository.findById(eventId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Event not found"));

                boolean isOrganizer = event.getOrganizer().equals(user);
                boolean isAdminOrMod = groupMemberRepository.findByGroupAndUser(event.getGroup(), user)
                                .map(m -> m.getRole() == GroupMember.GroupRole.ADMIN
                                                || m.getRole() == GroupMember.GroupRole.MODERATOR)
                                .orElse(false);

                if (!isOrganizer && !isAdminOrMod) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
                }

                groupEventRepository.delete(event);
        }
}
