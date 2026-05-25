ALTER TABLE direction_groups
    ADD COLUMN description VARCHAR(1000) NULL AFTER name;

ALTER TABLE schedule_sessions
    ADD COLUMN color VARCHAR(40) NULL AFTER room;

CREATE TABLE student_group_selections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    direction_group_id BIGINT NOT NULL,
    selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_group_selection_student UNIQUE (student_id),
    CONSTRAINT student_group_selections_student_fk FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT student_group_selections_direction_group_fk FOREIGN KEY (direction_group_id) REFERENCES direction_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_student_group_selections_group_id ON student_group_selections (direction_group_id);
