ALTER TABLE direction_groups
    ADD COLUMN semester INT NOT NULL DEFAULT 1 AFTER category_id,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER max_capacity;

ALTER TABLE direction_groups
    DROP INDEX uq_direction_group_category_name;

ALTER TABLE direction_groups
    ADD CONSTRAINT uq_direction_group_category_semester_name UNIQUE (category_id, semester, name);

CREATE INDEX idx_direction_groups_category_semester ON direction_groups (category_id, semester);
