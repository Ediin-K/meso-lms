ALTER TABLE quizzes
    ADD COLUMN pershkrimi TEXT NULL,
    ADD COLUMN publikuar BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE quiz_attempts
    ADD COLUMN started_at DATETIME NULL,
    ADD COLUMN expires_at DATETIME NULL,
    ADD COLUMN submitted_at DATETIME NULL,
    ADD COLUMN submitted BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE quiz_attempts
SET started_at = data,
    expires_at = DATE_ADD(data, INTERVAL koha_sekondat SECOND),
    submitted_at = data,
    submitted = TRUE
WHERE started_at IS NULL;

ALTER TABLE quiz_attempts
    MODIFY started_at DATETIME NOT NULL,
    MODIFY expires_at DATETIME NOT NULL;

CREATE TABLE answer_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_id BIGINT NOT NULL,
    CONSTRAINT answer_submissions_attempt_fk FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id),
    CONSTRAINT answer_submissions_question_fk FOREIGN KEY (question_id) REFERENCES quiz_questions (id),
    CONSTRAINT answer_submissions_answer_fk FOREIGN KEY (answer_id) REFERENCES quiz_answers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_answer_submissions_attempt_id ON answer_submissions (attempt_id);
CREATE INDEX idx_answer_submissions_question_id ON answer_submissions (question_id);
CREATE INDEX idx_answer_submissions_answer_id ON answer_submissions (answer_id);
