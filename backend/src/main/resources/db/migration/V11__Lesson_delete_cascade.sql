-- V11: Add ON DELETE CASCADE to FK constraints for automatic child cleanup.
-- Fully idempotent: uses DROP FOREIGN KEY IF EXISTS (MySQL 8.0.26+)
-- Safe to re-run regardless of current DB state.

-- quizzes.lesson_id -> lessons.id
ALTER TABLE quizzes
    DROP FOREIGN KEY IF EXISTS quizzes_lesson_fk,
    ADD CONSTRAINT quizzes_lesson_fk
        FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

-- assignments.lesson_id -> lessons.id
ALTER TABLE assignments
    DROP FOREIGN KEY IF EXISTS assignments_lesson_fk,
    ADD CONSTRAINT assignments_lesson_fk
        FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

-- quiz_questions.quiz_id -> quizzes.id
ALTER TABLE quiz_questions
    DROP FOREIGN KEY IF EXISTS quiz_questions_quiz_fk,
    ADD CONSTRAINT quiz_questions_quiz_fk
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

-- quiz_attempts.quiz_id -> quizzes.id
ALTER TABLE quiz_attempts
    DROP FOREIGN KEY IF EXISTS quiz_attempts_quiz_fk,
    ADD CONSTRAINT quiz_attempts_quiz_fk
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

-- quiz_answers.question_id -> quiz_questions.id
ALTER TABLE quiz_answers
    DROP FOREIGN KEY IF EXISTS quiz_answers_question_fk,
    ADD CONSTRAINT quiz_answers_question_fk
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

-- assignment_submissions.assignment_id -> assignments.id
ALTER TABLE assignment_submissions
    DROP FOREIGN KEY IF EXISTS assignment_submissions_assignment_fk,
    ADD CONSTRAINT assignment_submissions_assignment_fk
        FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE;

-- answer_submissions.attempt_id -> quiz_attempts.id
ALTER TABLE answer_submissions
    DROP FOREIGN KEY IF EXISTS answer_submissions_attempt_fk,
    ADD CONSTRAINT answer_submissions_attempt_fk
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id) ON DELETE CASCADE;

-- answer_submissions.question_id -> quiz_questions.id
ALTER TABLE answer_submissions
    DROP FOREIGN KEY IF EXISTS answer_submissions_question_fk,
    ADD CONSTRAINT answer_submissions_question_fk
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

-- answer_submissions.answer_id -> quiz_answers.id
ALTER TABLE answer_submissions
    DROP FOREIGN KEY IF EXISTS answer_submissions_answer_fk,
    ADD CONSTRAINT answer_submissions_answer_fk
        FOREIGN KEY (answer_id) REFERENCES quiz_answers (id) ON DELETE CASCADE;
