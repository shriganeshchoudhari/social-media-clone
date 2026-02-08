package com.example.social.group;

import com.example.social.group.dto.GroupRequest;
import com.example.social.group.dto.GroupResponse;
import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final com.example.social.group.invite.GroupInvitationRepository groupInvitationRepository;
    private final UserService userService;
    private final PostRepository postRepository;
    private final com.example.social.notification.NotificationService notificationService;
    private final com.example.social.group.event.GroupEventRepository groupEventRepository;

    public GroupService(
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            com.example.social.group.invite.GroupInvitationRepository groupInvitationRepository,
            UserService userService,
            PostRepository postRepository,
            com.example.social.notification.NotificationService notificationService,
            com.example.social.group.event.GroupEventRepository groupEventRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupInvitationRepository = groupInvitationRepository;
        this.userService = userService;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.groupEventRepository = groupEventRepository;
    }

    @Transactional
    public GroupResponse createGroup(String username, GroupRequest request) {
        User creator = userService.getUserByUsername(username);

        Group group = Group.builder()
                .name(request.name())
                .description(request.description())
                .privacy(Group.GroupPrivacy.valueOf(request.privacy()))
                .creator(creator)
                .build();

        group = groupRepository.save(group);

        // Add creator as ADMIN
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(creator)
                .role(GroupMember.GroupRole.ADMIN)
                .build();
        groupMemberRepository.save(member);

        return mapToResponse(group, creator);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getAllGroups(String username) {
        User user = userService.getUserByUsername(username);
        return groupRepository.findAll().stream()
                .map(g -> mapToResponse(g, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> searchGroups(String query, String username) {
        User user = userService.getUserByUsername(username);
        return groupRepository.searchGroups(query).stream()
                .map(g -> mapToResponse(g, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);
        return mapToResponse(group, user);
    }

    @Transactional
    public void joinGroup(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        if (group.getPrivacy() == Group.GroupPrivacy.PRIVATE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot join private group directly");
        }

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already a member");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMember.GroupRole.MEMBER)
                .build();
        groupMemberRepository.save(member);
    }

    @Transactional
    public void leaveGroup(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a member"));

        if (member.getRole() == GroupMember.GroupRole.ADMIN && groupMemberRepository.countByGroup(group) > 1) {
            // Basic check: Admin can't leave if they are the only one? Or should transfer
            // ownership?
            // For now, simplify: Admin can leave, but if they are the last one, group might
            // be empty.
            // Ideally implementing ownership transfer is better, but let's stick to simple
            // leave.
        }

        groupMemberRepository.delete(member);
    }

    @Transactional
    public void inviteUsers(Long groupId, String inviterUsername, List<String> usernames) {
        User inviter = userService.getUserByUsername(inviterUsername);
        Group group = getGroupEntity(groupId);

        // Check if inviter is admin
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, inviter)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));

        if (member.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can invite");
        }

        if (usernames == null || usernames.isEmpty()) {
            return;
        }

        List<String> failedUsers = new java.util.ArrayList<>();

        for (String username : usernames) {
            try {
                User invitee = userService.getUserByUsername(username);

                // Skip if already member
                if (groupMemberRepository.existsByGroupAndUser(group, invitee)) {
                    System.out.println("Invite Debug: User " + username + " is already a member.");
                    continue;
                }

                // Check if already invited
                var existingInvite = groupInvitationRepository.findByGroupAndInviteeAndStatus(group, invitee,
                        com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING);

                if (existingInvite.isPresent()) {
                    System.out
                            .println("Invite Debug: User " + username + " has pending invite. Resending notification.");
                    notificationService.create(invitee, com.example.social.notification.NotificationType.GROUP_INVITE,
                            group.getId(), inviter.getUsername(),
                            "invited you to join group: " + group.getName());
                    continue;
                }

                var invitation = com.example.social.group.invite.GroupInvitation.builder()
                        .group(group)
                        .inviter(inviter)
                        .invitee(invitee)
                        .status(com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING)
                        .type(com.example.social.group.invite.GroupInvitation.InvitationType.INVITE)
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

                groupInvitationRepository.save(invitation);

                System.out.println("Invite Debug: Sending notification to: " + invitee.getUsername());
                // Send Notification
                notificationService.create(invitee, com.example.social.notification.NotificationType.GROUP_INVITE,
                        group.getId(), inviter.getUsername(),
                        "invited you to join group: " + group.getName());

            } catch (Exception e) {
                System.out.println("Invite Debug: Error inviting " + username + ": " + e.getMessage());
                failedUsers.add(username);
            }
        }

        if (!failedUsers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid users: " + String.join(", ", failedUsers));
        }
    }

    @Transactional
    public void requestToJoin(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        if (group.getPrivacy() != Group.GroupPrivacy.PRIVATE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group is public, join directly");
        }

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already a member");
        }

        // Check for existing request
        if (groupInvitationRepository.findByGroupAndInviteeAndStatus(group, user,
                com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request already pending");
        }

        var request = com.example.social.group.invite.GroupInvitation.builder()
                .group(group)
                .inviter(null) // Self-initiated
                .invitee(user)
                .status(com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING)
                .type(com.example.social.group.invite.GroupInvitation.InvitationType.JOIN_REQUEST)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        groupInvitationRepository.save(request);

        // Notify Admins
        List<GroupMember> admins = groupMemberRepository.findAllByGroupAndRole(group, GroupMember.GroupRole.ADMIN);
        for (GroupMember admin : admins) {
            notificationService.create(admin.getUser(),
                    com.example.social.notification.NotificationType.GROUP_JOIN_REQUEST,
                    group.getId(), user.getUsername(),
                    "requested to join " + group.getName());
        }
    }

    @Transactional
    public void approveJoinRequest(Long invitationId, String adminUsername) {
        var invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        // Check admin permissions
        Group group = invitation.getGroup();
        User admin = userService.getUserByUsername(adminUsername);
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, admin)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));

        if (member.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can approve");
        }

        invitation.setStatus(com.example.social.group.invite.GroupInvitation.InvitationStatus.ACCEPTED);
        groupInvitationRepository.save(invitation);

        // Add to group
        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(invitation.getInvitee())
                .role(GroupMember.GroupRole.MEMBER)
                .build();
        groupMemberRepository.save(newMember);

        // Notify User
        notificationService.create(invitation.getInvitee(),
                com.example.social.notification.NotificationType.GROUP_JOIN_APPROVED,
                group.getId(), admin.getUsername(),
                "approved your request to join " + group.getName());
    }

    @Transactional
    public void acceptInvitation(Long invitationId, String username) {
        var invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getInvitee().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your invitation");
        }

        if (invitation.getStatus() != com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation not pending");
        }

        invitation.setStatus(com.example.social.group.invite.GroupInvitation.InvitationStatus.ACCEPTED);
        groupInvitationRepository.save(invitation);

        // Add to group
        GroupMember member = GroupMember.builder()
                .group(invitation.getGroup())
                .user(invitation.getInvitee())
                .role(GroupMember.GroupRole.MEMBER)
                .build();
        groupMemberRepository.save(member);
    }

    @Transactional
    public void rejectInvitation(Long invitationId, String username) {
        var invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getInvitee().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your invitation");
        }

        invitation.setStatus(com.example.social.group.invite.GroupInvitation.InvitationStatus.REJECTED);
        groupInvitationRepository.save(invitation);
    }

    public List<com.example.social.group.invite.GroupInvitation> getMyInvitations(String username) {
        User user = userService.getUserByUsername(username);
        return groupInvitationRepository.findByInviteeAndStatus(user,
                com.example.social.group.invite.GroupInvitation.InvitationStatus.PENDING);
    }

    // Helper
    private Group getGroupEntity(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
    }

    private GroupResponse mapToResponse(Group group, User viewer) {
        var memberOpt = groupMemberRepository.findByGroupAndUser(group, viewer);
        boolean isMember = memberOpt.isPresent();
        String role = memberOpt.map(m -> m.getRole().name()).orElse(null);
        long count = groupMemberRepository.countByGroup(group);

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getPrivacy().name(),
                group.getCreator().getUsername(),
                count,
                isMember,
                role,
                group.getCoverImageUrl(),
                group.getPinnedPost() != null ? group.getPinnedPost().getId() : null,
                group.getCreatedAt());
    }

    @Transactional
    public GroupResponse uploadCoverImage(Long groupId, String username,
            org.springframework.web.multipart.MultipartFile file) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        // Check Admin
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (member.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can upload cover");
        }

        // Use FileService logic (Assuming FileService exists or copy logic?
        // I'll assume we can use a helper or inject FileService if it exists.
        // Actually UserService handles files.
        // Let's create a simple FileStorageService or copy the logic for now.
        // To be quick, I'll use the same logic as UserController.

        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path path = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(path)) {
                java.nio.file.Files.createDirectories(path);
            }
            java.nio.file.Files.copy(file.getInputStream(), path.resolve(fileName),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "/uploads/" + fileName;

            group.setCoverImageUrl(fileUrl);
            return mapToResponse(groupRepository.save(group), user);
        } catch (java.io.IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload");
        }
    }

    @Transactional
    public GroupResponse pinPost(Long groupId, Long postId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        // Check Admin
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (member.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can pin posts");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!group.equals(post.getGroup())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to group");
        }

        group.setPinnedPost(post);
        return mapToResponse(groupRepository.save(group), user);
    }

    @Transactional
    public GroupResponse unpinPost(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        // Check Admin
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (member.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can unpin posts");
        }

        group.setPinnedPost(null);
        return mapToResponse(groupRepository.save(group), user);
    }

    @Transactional
    public GroupResponse updateGroup(Long groupId, String username, GroupRequest request) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        // Check ownership
        if (!group.getCreator().equals(user)) {
            // Or allow ADMIN? For now strict owner or check admin role
            GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
            if (member.getRole() != GroupMember.GroupRole.ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can update group");
            }
        }

        group.setName(request.name());
        group.setDescription(request.description());
        group.setPrivacy(Group.GroupPrivacy.valueOf(request.privacy()));

        group = groupRepository.save(group);
        return mapToResponse(group, user);
    }

    @Transactional
    public void deleteGroup(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        if (!group.getCreator().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can delete the group");
        }

        // Manual Cascade Delete
        postRepository.deleteByGroup(group);
        groupEventRepository.deleteByGroup(group);
        groupInvitationRepository.deleteByGroup(group);
        groupMemberRepository.deleteByGroup(group);

        groupRepository.delete(group);
    }

    @Transactional
    public void removeMember(Long groupId, String adminUsername, Long userId) {
        User admin = userService.getUserByUsername(adminUsername);
        Group group = getGroupEntity(groupId);
        User targetUser = userService.getUserById(userId).orElseThrow();

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, admin)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));

        if (adminMember.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can remove members");
        }

        if (targetUser.equals(group.getCreator())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove the creator");
        }

        GroupMember targetMember = groupMemberRepository.findByGroupAndUser(group, targetUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not in group"));

        groupMemberRepository.delete(targetMember);
    }

    @Transactional
    public void changeRole(Long groupId, String adminUsername, Long userId, String role) {
        User admin = userService.getUserByUsername(adminUsername);
        Group group = getGroupEntity(groupId);
        User targetUser = userService.getUserById(userId).orElseThrow();

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, admin)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));

        if (adminMember.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can change roles");
        }

        GroupMember targetMember = groupMemberRepository.findByGroupAndUser(group, targetUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not in group"));

        targetMember.setRole(GroupMember.GroupRole.valueOf(role));
        groupMemberRepository.save(targetMember);
    }

    @Transactional(readOnly = true)
    public List<com.example.social.group.dto.GroupMemberResponse> getGroupMembers(Long groupId, String username) {
        User user = userService.getUserByUsername(username);
        Group group = getGroupEntity(groupId);

        if (group.getPrivacy() == Group.GroupPrivacy.PRIVATE
                && !groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private group");
        }

        return groupMemberRepository.findByGroup(group).stream()
                .map(m -> com.example.social.group.dto.GroupMemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .fullName(m.getUser().getUsername())
                        .profileImageUrl(m.getUser().getProfileImageUrl())
                        .role(m.getRole())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<Post> getGroupFeed(Long groupId, Pageable pageable) {
        Group group = getGroupEntity(groupId);
        return postRepository.findByGroup(group, pageable);
    }
}
