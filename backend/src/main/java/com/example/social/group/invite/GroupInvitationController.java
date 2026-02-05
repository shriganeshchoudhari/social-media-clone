package com.example.social.group.invite;

import com.example.social.group.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/invitations")
@RequiredArgsConstructor
public class GroupInvitationController {

    private final GroupService groupService;

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
        // Can be used for rejecting invites (by user) or rejecting values (by admin)?
        // Service has rejectInvitation(id, username).
        // If admin rejecting request: need separate method or reuse?
        // Service rejectInvitation checks "Not your invitation".
        // Admin rejection logic not fully in service yet?
        // Re-using rejectInvitation for USER rejecting an INVITE.
        // For ADMIN rejecting a REQUEST, we need logic.
        // Let's assume for now this is for User rejecting invalid.
        groupService.rejectInvitation(id, auth.getName());
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InviteRequest {
        private Long groupId;
        private List<String> usernames;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class JoinRequest {
        private Long groupId;
    }

    @GetMapping("/my")
    public List<GroupInvitation> getMyInvitations(Authentication auth) {
        return groupService.getMyInvitations(auth.getName());
    }
}
