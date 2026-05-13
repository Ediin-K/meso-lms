-- V2__Add_teacher_support.sql
-- Migration for teacher management and course teacher assignment

-- Add NOT NULL constraint to teacher_id in courses (already exists in V1, but ensuring it's enforced)
-- The teacher_id foreign key is already defined in V1

-- Ensure indexes on teacher_id for performance
CREATE INDEX idx_courses_teacher_id_search ON courses (teacher_id);

-- Optional: Add unique index to prevent duplicate course assignments if needed
-- (not applying here as a course can theoretically be taught by multiple teachers in different semesters)
