ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS activated_at DATETIME    NULL,
    ADD COLUMN IF NOT EXISTS closed_at    DATETIME    NULL;

UPDATE quizzes SET status = 'ACTIVE' WHERE publikuar = TRUE  AND status = 'DRAFT';
UPDATE quizzes SET status = 'DRAFT'  WHERE publikuar = FALSE AND status = 'DRAFT';

UPDATE quizzes SET activated_at = created_at WHERE status = 'ACTIVE' AND activated_at IS NULL;

ALTER TABLE quiz_attempts
    ADD COLUMN IF NOT EXISTS abandoned    BOOLEAN  NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS abandoned_at DATETIME NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_status        ON quizzes (status);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_status ON quizzes (lesson_id, status);
