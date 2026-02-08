package com.example.social.search;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, String> {
    Page<UserDocument> findByUsernameContaining(String username, Pageable pageable);

    java.util.List<UserDocument> findByUsernameContaining(String username);
}
