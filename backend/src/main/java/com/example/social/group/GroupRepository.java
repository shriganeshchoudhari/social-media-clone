package com.example.social.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByPrivacy(Group.GroupPrivacy privacy);

    @Query("SELECT g FROM SocialGroup g WHERE lower(g.name) LIKE lower(concat('%', :query, '%'))")
    List<Group> searchGroups(String query);
}
