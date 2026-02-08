package com.example.social.group;

import com.example.social.group.dto.GroupRequest;
import com.example.social.group.dto.GroupResponse;
import com.example.social.post.Post;
import com.example.social.post.dto.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    // We might need PostService to map posts, or do mapping in GroupService?
    // GroupService returns Post entities, so we need to map them here or in
    // service.
    // PostService has mapToResponse which is private inside it.
    // Ideally PostService should handle post retrieval logic including mapping.
    // But GroupService implements getGroupFeed(groupId).
    // Let's refactor GroupService to return Page<PostResponse> by using
    // PostService's mapper?
    // Or simpler: GroupController maps it? PostResponse mapping requires logic
    // (likedByMe etc).
    // Better: GroupService returns Page<PostResponse> and uses a PostMapper or
    // calls PostService.
    // Let's defer PostResponse mapping to GroupService, assuming we can make
    // mapToResponse public/accessible or duplicate logic?
    // No, duplicate is bad.
    // I already injected PostRepository into GroupService. PostService is better
    // suited to map.
    // Let's inject PostService into GroupService? Circular dependency: PostService
    // -> GroupRepository, GroupService -> PostService.
    // Avoiding circular dependency: Extract PostMapper. Or use helper.
    // For now, let's keep getGroupFeed in GroupService as Page<Post> and map it in
    // Controller?
    // But Controller doesn't have access to likes/saved logic easily without
    // duplicating.
    // Cleanest short-term: Inject PostService into GroupController and use it to
    // map posts?
    // PostService doesn't have a public map method.
    // I will add a public map method to PostService.

    private final com.example.social.post.PostService postService;

    public GroupController(GroupService groupService, com.example.social.post.PostService postService) {
        this.groupService = groupService;
        this.postService = postService;
    }

    @PostMapping
    public GroupResponse createGroup(@RequestBody GroupRequest request, Authentication auth) {
        return groupService.createGroup(auth.getName(), request);
    }

    @GetMapping
    public List<GroupResponse> getAllGroups(Authentication auth) {
        return groupService.getAllGroups(auth.getName());
    }

    @GetMapping("/search")
    public List<GroupResponse> searchGroups(@RequestParam String q, Authentication auth) {
        return groupService.searchGroups(q, auth.getName());
    }

    @GetMapping("/{id}")
    public GroupResponse getGroup(@PathVariable Long id, Authentication auth) {
        return groupService.getGroup(id, auth.getName());
    }

    @PostMapping("/{id}/join")
    public void joinGroup(@PathVariable Long id, Authentication auth) {
        groupService.joinGroup(id, auth.getName());
    }

    @PostMapping("/{id}/leave")
    public void leaveGroup(@PathVariable Long id, Authentication auth) {
        groupService.leaveGroup(id, auth.getName());
    }

    @GetMapping("/{id}/posts")
    public Page<PostResponse> getGroupPosts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        // Assuming GroupService returns Page<Post>
        Page<Post> posts = groupService.getGroupFeed(id, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        // Use PostService to map (I need to expose a mapping method or utilize existing
        // one)
        // Since I can't easily expose private method, I'll add a method to PostService:
        // mapPosts(Page<Post> posts, String username)
        return postService.mapPosts(posts, auth.getName());
    }

    @PutMapping("/{id}")
    public GroupResponse updateGroup(@PathVariable Long id, @RequestBody GroupRequest request, Authentication auth) {
        return groupService.updateGroup(id, auth.getName(), request);
    }

    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Long id, Authentication auth) {
        groupService.deleteGroup(id, auth.getName());
    }

    @DeleteMapping("/{id}/members/{userId}")
    public void removeMember(@PathVariable Long id, @PathVariable Long userId, Authentication auth) {
        groupService.removeMember(id, auth.getName(), userId);
    }

    @PutMapping("/{id}/members/{userId}/role")
    public void changeRole(@PathVariable Long id, @PathVariable Long userId, @RequestParam String role,
            Authentication auth) {
        groupService.changeRole(id, auth.getName(), userId, role);
    }

    @GetMapping("/{id}/members")
    public List<com.example.social.group.dto.GroupMemberResponse> getGroupMembers(@PathVariable Long id,
            Authentication auth) {
        return groupService.getGroupMembers(id, auth.getName());
    }

    @PostMapping("/{id}/cover")
    public GroupResponse uploadCoverImage(@PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file, Authentication auth) {
        return groupService.uploadCoverImage(id, auth.getName(), file);
    }

    @PutMapping("/{id}/pin/{postId}")
    public GroupResponse pinPost(@PathVariable Long id, @PathVariable Long postId, Authentication auth) {
        return groupService.pinPost(id, postId, auth.getName());
    }

    @DeleteMapping("/{id}/pin")
    public GroupResponse unpinPost(@PathVariable Long id, Authentication auth) {
        return groupService.unpinPost(id, auth.getName());
    }
}
