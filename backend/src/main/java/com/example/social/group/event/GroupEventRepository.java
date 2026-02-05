package com.example.social.group.event;

import com.example.social.group.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupEventRepository extends JpaRepository<GroupEvent, Long> {
    List<GroupEvent> findByGroupOrderByStartTimeAsc(Group group);

    void deleteByGroup(Group group);
}
