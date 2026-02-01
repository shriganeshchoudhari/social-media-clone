CREATE TABLE saved_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    post_id BIGINT NOT NULL REFERENCES posts(id),
    created_at TIMESTAMP,
    CONSTRAINT uk_saved_post UNIQUE (user_id, post_id)
);
