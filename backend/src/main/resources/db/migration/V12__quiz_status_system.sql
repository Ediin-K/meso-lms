-- V12: Quiz status system

ALTER TABLE quizzes
    ADD COLUMN status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN activated_at DATETIME    NULL,
    ADD COLUMN closed_at    DATETIME    NULL;

UPDATE quizzes SET status = 'ACTIVE' WHERE publikuar = TRUE  AND status = 'DRAFT';
UPDATE quizzes SET status = 'DRAFT'  WHERE publikuar = FALSE AND status = 'DRAFT';

UPDATE quizzes SET activated_at = created_at WHERE status = 'ACTIVE' AND activated_at IS NULL;

ALTER TABLE quiz_attempts
    ADD COLUMN abandoned    BOOLEAN  NOT NULL DEFAULT FALSE,
    ADD COLUMN abandoned_at DATETIME NULL;

CREATE INDEX idx_quizzes_status        ON quizzes (status);
CREATE INDEX idx_quizzes_lesson_status ON quizzes (lesson_id, status);