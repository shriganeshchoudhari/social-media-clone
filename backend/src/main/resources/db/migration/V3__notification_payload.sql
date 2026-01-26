ALTER TABLE notifications
ADD COLUMN type VARCHAR(20),
ADD COLUMN reference_id BIGINT,
ADD COLUMN actor_username VARCHAR(50);
