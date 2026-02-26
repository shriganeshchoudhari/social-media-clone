-- Add rules to social_groups
ALTER TABLE social_groups ADD COLUMN rules VARCHAR(1000);

-- Revert group_events to link to social_groups
-- Dropping the V110 table and recreating or modifying it

DROP TABLE social_group_events;

CREATE TABLE social_group_events (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES social_groups(id) ON DELETE CASCADE,
    organizer_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
