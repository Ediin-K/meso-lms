CREATE TABLE course_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INT,
    schedule VARCHAR(255),
    CONSTRAINT course_groups_course_fk FOREIGN KEY (course_id) REFERENCES courses (id),
    CONSTRAINT uq_course_groups_course_name UNIQUE (course_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_subgroups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_group_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INT,
    schedule VARCHAR(255),
    CONSTRAINT course_subgroups_group_fk FOREIGN KEY (course_group_id) REFERENCES course_groups (id),
    CONSTRAINT uq_course_subgroups_group_name UNIQUE (course_group_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_group_teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_group_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PROFESSOR',
    CONSTRAINT course_group_teachers_group_fk FOREIGN KEY (course_group_id) REFERENCES course_groups (id),
    CONSTRAINT course_group_teachers_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users (id),
    CONSTRAINT uq_course_group_teacher UNIQUE (course_group_id, teacher_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_subgroup_teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_subgroup_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ASSISTANT',
    CONSTRAINT course_subgroup_teachers_subgroup_fk FOREIGN KEY (course_subgroup_id) REFERENCES course_subgroups (id),
    CONSTRAINT course_subgroup_teachers_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users (id),
    CONSTRAINT uq_course_subgroup_teacher UNIQUE (course_subgroup_id, teacher_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE enrollments
    ADD COLUMN course_group_id BIGINT NULL,
    ADD COLUMN course_subgroup_id BIGINT NULL,
    ADD CONSTRAINT enrollments_course_group_fk FOREIGN KEY (course_group_id) REFERENCES course_groups (id),
    ADD CONSTRAINT enrollments_course_subgroup_fk FOREIGN KEY (course_subgroup_id) REFERENCES course_subgroups (id),
    ADD CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id);

CREATE INDEX idx_course_groups_course_id ON course_groups (course_id);
CREATE INDEX idx_course_subgroups_group_id ON course_subgroups (course_group_id);
CREATE INDEX idx_course_group_teachers_group_id ON course_group_teachers (course_group_id);
CREATE INDEX idx_course_group_teachers_teacher_id ON course_group_teachers (teacher_id);
CREATE INDEX idx_course_subgroup_teachers_subgroup_id ON course_subgroup_teachers (course_subgroup_id);
CREATE INDEX idx_course_subgroup_teachers_teacher_id ON course_subgroup_teachers (teacher_id);
CREATE INDEX idx_enrollments_course_group_id ON enrollments (course_group_id);
CREATE INDEX idx_enrollments_course_subgroup_id ON enrollments (course_subgroup_id);
