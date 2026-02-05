package com.example.social.group.invite;

import com.example.social.group.Group;
import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {
    List<GroupInvitation> findByInviteeAndStatus(User invitee, GroupInvitation.InvitationStatus status);

    Optional<GroupInvitation> findByGroupAndInviteeAndStatus(Group group, User invitee,
            GroupInvitation.InvitationStatus status);

    void deleteByGroup(Group group);
}
