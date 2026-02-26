DROP TABLE IF EXISTS social_group_events;

CREATE TABLE social_group_events (
    id BIGSERIAL PRIMARY KEY,
    chat_group_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(255),
    created_at TIMESTAMP,
    FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id),
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);
