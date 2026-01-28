CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id),
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
