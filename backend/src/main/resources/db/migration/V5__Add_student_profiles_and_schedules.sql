CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    category_id BIGINT,
    current_semester INT NOT NULL DEFAULT 1,
    CONSTRAINT student_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT student_profiles_category_fk FOREIGN KEY (category_id) REFERENCES course_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schedule_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    course_group_id BIGINT,
    course_subgroup_id BIGINT,
    teacher_id BIGINT NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(255),
    capacity INT NOT NULL DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT schedule_sessions_type_check CHECK (session_type IN ('LECTURE', 'EXERCISE')),
    CONSTRAINT schedule_sessions_day_check CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    CONSTRAINT schedule_sessions_course_fk FOREIGN KEY (course_id) REFERENCES courses (id),
    CONSTRAINT schedule_sessions_group_fk FOREIGN KEY (course_group_id) REFERENCES course_groups (id),
    CONSTRAINT schedule_sessions_subgroup_fk FOREIGN KEY (course_subgroup_id) REFERENCES course_subgroups (id),
    CONSTRAINT schedule_sessions_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_student_profiles_user_id ON student_profiles (user_id);
CREATE INDEX idx_student_profiles_category_semester ON student_profiles (category_id, current_semester);
CREATE INDEX idx_schedule_sessions_course_id ON schedule_sessions (course_id);
CREATE INDEX idx_schedule_sessions_group_id ON schedule_sessions (course_group_id);
CREATE INDEX idx_schedule_sessions_subgroup_id ON schedule_sessions (course_subgroup_id);
CREATE INDEX idx_schedule_sessions_teacher_id ON schedule_sessions (teacher_id);
CREATE INDEX idx_schedule_sessions_day ON schedule_sessions (day_of_week);
