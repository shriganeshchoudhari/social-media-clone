CREATE TABLE story_views (
    id BIGSERIAL PRIMARY KEY,
    story_id BIGINT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT uk_story_viewer UNIQUE (story_id, viewer_id)
);

CREATE INDEX idx_story_views_story_id ON story_views(story_id);
