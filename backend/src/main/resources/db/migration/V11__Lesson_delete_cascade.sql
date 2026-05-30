-- V11: Add ON DELETE CASCADE to FK constraints

ALTER TABLE quizzes DROP FOREIGN KEY quizzes_lesson_fk;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_lesson_fk FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

ALTER TABLE assignments DROP FOREIGN KEY assignments_lesson_fk;
ALTER TABLE assignments ADD CONSTRAINT assignments_lesson_fk FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE;

ALTER TABLE quiz_questions DROP FOREIGN KEY quiz_questions_quiz_fk;
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts DROP FOREIGN KEY quiz_attempts_quiz_fk;
ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;

ALTER TABLE quiz_answers DROP FOREIGN KEY quiz_answers_question_fk;
ALTER TABLE quiz_answers ADD CONSTRAINT quiz_answers_question_fk FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

ALTER TABLE assignment_submissions DROP FOREIGN KEY assignment_submissions_assignment_fk;
ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_fk FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE;

ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_attempt_fk;
ALTER TABLE answer_submissions ADD CONSTRAINT answer_submissions_attempt_fk FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id) ON DELETE CASCADE;

ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_question_fk;
ALTER TABLE answer_submissions ADD CONSTRAINT answer_submissions_question_fk FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE;

ALTER TABLE answer_submissions DROP FOREIGN KEY answer_submissions_answer_fk;
ALTER TABLE answer_submissions ADD CONSTRAINT answer_submissions_answer_fk FOREIGN KEY (answer_id) REFERENCES quiz_answers (id) ON DELETE CASCADE;