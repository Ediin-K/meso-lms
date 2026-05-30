ALTER TABLE courses
    ADD COLUMN ects INT NOT NULL DEFAULT 5;

-- Lëndë bazë / thelbësore (6 ECTS)
UPDATE courses SET ects = 6
WHERE LOWER(titulli) LIKE '%shkenca kompjuterike%'
   OR LOWER(titulli) LIKE '%algoritme%'
   OR LOWER(titulli) LIKE '%sinjale%'
   OR LOWER(titulli) LIKE '%programim%'
   OR LOWER(titulli) LIKE '%inteligjenc%'
   OR LOWER(titulli) LIKE '%artificial intelligence%';

-- Sisteme Operative (5 ECTS — siç kërkoi përdoruesi)
UPDATE courses SET ects = 5
WHERE LOWER(titulli) LIKE '%sisteme operative%'
   OR LOWER(titulli) LIKE '%operating system%';

-- Lëndë standarde (5 ECTS)
UPDATE courses SET ects = 5
WHERE LOWER(titulli) LIKE '%diskrete%'
   OR LOWER(titulli) LIKE '%matematik%'
   OR LOWER(titulli) LIKE '%web%'
   OR LOWER(titulli) LIKE '%ueb%'
   OR LOWER(titulli) LIKE '%dizajni%'
   OR LOWER(titulli) LIKE '%database%'
   OR LOWER(titulli) LIKE '%baza%'
   OR LOWER(titulli) LIKE '%rrjet%'
   OR LOWER(titulli) LIKE '%network%'
   OR LOWER(titulli) LIKE '%softuer%'
   OR LOWER(titulli) LIKE '%software%'
   OR LOWER(titulli) LIKE '%siguri%'
   OR LOWER(titulli) LIKE '%security%'
   OR LOWER(titulli) LIKE '%architektur%';

-- Gjuhë / lëndë mbështetëse (3 ECTS)
UPDATE courses SET ects = 3
WHERE LOWER(titulli) LIKE '%anglisht%'
   OR LOWER(titulli) LIKE '%english%'
   OR LOWER(titulli) LIKE '%gjuh%';
