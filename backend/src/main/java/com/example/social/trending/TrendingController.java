package com.example.social.trending;

import com.example.social.post.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trending")
public class TrendingController {

    private final PostService postService;

    public TrendingController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<TrendingTopicDTO> getTrendingTopics() {
        return postService.getTrendingHashtags();
    }
}
