CREATE TABLE direction_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 30,
    CONSTRAINT uq_direction_group_category_name UNIQUE (category_id, name),
    CONSTRAINT direction_groups_category_fk FOREIGN KEY (category_id) REFERENCES course_categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE course_groups
    ADD COLUMN direction_group_id BIGINT NULL,
    ADD CONSTRAINT course_groups_direction_group_fk FOREIGN KEY (direction_group_id) REFERENCES direction_groups (id) ON DELETE SET NULL;

ALTER TABLE student_profiles
    ADD COLUMN approved_direction_group_id BIGINT NULL,
    ADD CONSTRAINT student_profiles_direction_group_fk FOREIGN KEY (approved_direction_group_id) REFERENCES direction_groups (id) ON DELETE SET NULL;

CREATE TABLE student_group_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    direction_group_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT NULL,
    CONSTRAINT student_group_requests_student_fk FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT student_group_requests_direction_group_fk FOREIGN KEY (direction_group_id) REFERENCES direction_groups (id) ON DELETE CASCADE,
    CONSTRAINT student_group_requests_approved_by_fk FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_direction_groups_category_id ON direction_groups (category_id);
CREATE INDEX idx_course_groups_direction_group_id ON course_groups (direction_group_id);
CREATE INDEX idx_student_profiles_approved_direction_group_id ON student_profiles (approved_direction_group_id);
CREATE INDEX idx_student_group_requests_student_status ON student_group_requests (student_id, status);
CREATE INDEX idx_student_group_requests_direction_status ON student_group_requests (direction_group_id, status);
