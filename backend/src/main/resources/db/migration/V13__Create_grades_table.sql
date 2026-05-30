CREATE TABLE grades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    grade INT NOT NULL,
    comment TEXT,
    assigned_at DATETIME NOT NULL,
    CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_professor FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_grades_student_course UNIQUE (student_id, course_id),
    CONSTRAINT chk_grades_range CHECK (grade >= 5 AND grade <= 10)
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_professor ON grades(professor_id);
