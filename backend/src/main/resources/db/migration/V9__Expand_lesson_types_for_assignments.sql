SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'lessons'
      AND constraint_name = 'lessons_lloji_check'
);

SET @sql = IF(
    @constraint_exists > 0,
    'ALTER TABLE lessons DROP CHECK lessons_lloji_check',
    'SELECT "Constraint does not exist"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add new constraint
ALTER TABLE lessons
    ADD CONSTRAINT lessons_lloji_check
        CHECK (lloji IN ('VIDEO', 'TEKST', 'QUIZ', 'ASSIGNMENT'));