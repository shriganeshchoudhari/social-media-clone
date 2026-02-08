package com.example.social.group.invite;

import com.example.social.group.GroupService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/invitations")
public class GroupInvitationController {

    private final GroupService groupService;

    public GroupInvitationController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/invite")
    public void inviteUsers(@RequestBody InviteRequest request, Authentication auth) {
        System.out.println("Invite Request: " + request);
        groupService.inviteUsers(request.getGroupId(), auth.getName(), request.getUsernames());
    }

    @PostMapping("/request")
    public void requestToJoin(@RequestBody JoinRequest request, Authentication auth) {
        groupService.requestToJoin(request.getGroupId(), auth.getName());
    }

    @PostMapping("/{id}/accept")
    public void acceptInvitation(@PathVariable Long id, Authentication auth) {
        groupService.acceptInvitation(id, auth.getName());
    }

    @PostMapping("/{id}/approve")
    public void approveRequest(@PathVariable Long id, Authentication auth) {
        groupService.approveJoinRequest(id, auth.getName());
    }

    @PostMapping("/{id}/reject")
    public void rejectInvitation(@PathVariable Long id, Authentication auth) {
        groupService.rejectInvitation(id, auth.getName());
    }

    public static class InviteRequest {
        private Long groupId;
        private List<String> usernames;

        public InviteRequest() {
        }

        public InviteRequest(Long groupId, List<String> usernames) {
            this.groupId = groupId;
            this.usernames = usernames;
        }

        public Long getGroupId() {
            return groupId;
        }

        public void setGroupId(Long groupId) {
            this.groupId = groupId;
        }

        public List<String> getUsernames() {
            return usernames;
        }

        public void setUsernames(List<String> usernames) {
            this.usernames = usernames;
        }
    }

    public static class JoinRequest {
        private Long groupId;

        public JoinRequest() {
        }

        public JoinRequest(Long groupId) {
            this.groupId = groupId;
        }

        public Long getGroupId() {
            return groupId;
        }

        public void setGroupId(Long groupId) {
            this.groupId = groupId;
        }
    }

    @GetMapping("/my")
    public List<GroupInvitation> getMyInvitations(Authentication auth) {
        return groupService.getMyInvitations(auth.getName());
    }
}
