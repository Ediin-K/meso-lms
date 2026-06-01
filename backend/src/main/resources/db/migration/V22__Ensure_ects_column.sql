-- Siguron kolonën ects për DB që ishin tashmë në v21+ para shtimit të ECTS
SET @ects_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'courses'
      AND COLUMN_NAME = 'ects'
);

SET @ddl := IF(
    @ects_exists = 0,
    'ALTER TABLE courses ADD COLUMN ects INT NOT NULL DEFAULT 5',
    'SELECT 1'
);

PREPARE ects_stmt FROM @ddl;
EXECUTE ects_stmt;
DEALLOCATE PREPARE ects_stmt;

UPDATE courses SET ects = 6
WHERE LOWER(titulli) LIKE '%shkenca kompjuterike%'
   OR LOWER(titulli) LIKE '%algoritme%'
   OR LOWER(titulli) LIKE '%sinjale%'
   OR LOWER(titulli) LIKE '%programim%';

UPDATE courses SET ects = 5
WHERE LOWER(titulli) LIKE '%sisteme operative%'
   OR LOWER(titulli) LIKE '%operating system%'
   OR LOWER(titulli) LIKE '%diskrete%'
   OR LOWER(titulli) LIKE '%matematik%'
   OR LOWER(titulli) LIKE '%web%'
   OR LOWER(titulli) LIKE '%database%'
   OR LOWER(titulli) LIKE '%rrjet%';

UPDATE courses SET ects = 3
WHERE LOWER(titulli) LIKE '%anglisht%'
   OR LOWER(titulli) LIKE '%english%';

UPDATE courses SET ects = 4
WHERE LOWER(TRIM(titulli)) IN ('java basics', 'java basic', 'bazat e java')
   OR LOWER(titulli) LIKE '%java basics%'
   OR LOWER(titulli) LIKE '%java basic%'
   OR (LOWER(titulli) LIKE '%java%' AND LOWER(titulli) LIKE '%basic%')
   OR (LOWER(titulli) LIKE '%java%' AND LOWER(titulli) LIKE '%baz%');
