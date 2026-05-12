-- Flyway baseline migration for Meson LMS
-- MySQL 8+ compatible full schema derived from JPA entities

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(255) NOT NULL UNIQUE,
    pershkrimi TEXT,
    normalized_name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(255) NOT NULL,
    mbiemri VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255),
    email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    lockout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    access_failed_count INT NOT NULL DEFAULT 0,
    data_krijimit DATETIME NOT NULL,
    statusi VARCHAR(50) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(255) NOT NULL UNIQUE,
    pershkrimi TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(255) NOT NULL UNIQUE,
    pershkrimi VARCHAR(255) NOT NULL,
    teacher_id BIGINT,
    category_id BIGINT,
    semester INT NOT NULL,
    enrollment_key VARCHAR(255),
    cmimi DOUBLE NOT NULL DEFAULT 0.0,
    niveli VARCHAR(50) NOT NULL DEFAULT 'FILLESTAR',
    statusi VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL,
    CONSTRAINT courses_niveli_check CHECK (niveli IN ('FILLESTAR', 'MESATAR', 'AVANCUAR', 'TE_GJITHA_NIVELET')),
    CONSTRAINT courses_statusi_check CHECK (statusi IN ('DRAFT', 'PUBLIKUAR', 'ARKIVUAR')),
    CONSTRAINT courses_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users (id),
    CONSTRAINT courses_category_fk FOREIGN KEY (category_id) REFERENCES course_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(255) NOT NULL,
    pershkrimi VARCHAR(255) NOT NULL,
    rradhitja INT NOT NULL,
    created_at DATETIME NOT NULL,
    course_id BIGINT NOT NULL,
    CONSTRAINT modules_course_fk FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(255) NOT NULL,
    permbajtja TEXT,
    lloji VARCHAR(50) NOT NULL DEFAULT 'TEKST',
    video_url VARCHAR(255),
    resource_url VARCHAR(255),
    rradhitja INT NOT NULL,
    module_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT lessons_lloji_check CHECK (lloji IN ('VIDEO', 'TEKST', 'QUIZ')),
    CONSTRAINT lessons_module_fk FOREIGN KEY (module_id) REFERENCES modules (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(255) NOT NULL,
    kohezgjatja_minuta INT NOT NULL,
    lesson_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT quizzes_lesson_fk FOREIGN KEY (lesson_id) REFERENCES lessons (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pyetja TEXT NOT NULL,
    lloji VARCHAR(50) NOT NULL,
    rradhitja INT NOT NULL,
    quiz_id BIGINT NOT NULL,
    CONSTRAINT quiz_questions_lloji_check CHECK (lloji IN ('SHUMEFISHTE', 'VERTET_GABIM', 'TEXT')),
    CONSTRAINT quiz_questions_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pergjigja VARCHAR(255) NOT NULL,
    eshte_sakte BOOLEAN NOT NULL,
    question_id BIGINT NOT NULL,
    CONSTRAINT quiz_answers_question_fk FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    pikete DOUBLE NOT NULL,
    koha_sekondat INT NOT NULL,
    data DATETIME NOT NULL,
    CONSTRAINT quiz_attempts_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
    CONSTRAINT quiz_attempts_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(255) NOT NULL,
    pershkrimi TEXT,
    resource_url VARCHAR(255),
    deadline DATETIME NOT NULL,
    statusi VARCHAR(50) NOT NULL DEFAULT 'AKTIV',
    lesson_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT assignments_statusi_check CHECK (statusi IN ('AKTIV', 'MBYLLUR', 'DRAFT')),
    CONSTRAINT assignments_lesson_fk FOREIGN KEY (lesson_id) REFERENCES lessons (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_url VARCHAR(255),
    pershkrimi TEXT,
    nota DOUBLE,
    statusi VARCHAR(50) NOT NULL DEFAULT 'DOREZUAR',
    submitted_at DATETIME NOT NULL,
    CONSTRAINT assignment_submissions_statusi_check CHECK (statusi IN ('DOREZUAR', 'VLERESUAR', 'VONUAR')),
    CONSTRAINT assignment_submissions_assignment_fk FOREIGN KEY (assignment_id) REFERENCES assignments (id),
    CONSTRAINT assignment_submissions_student_fk FOREIGN KEY (student_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    progresi DOUBLE DEFAULT 0.0,
    statusi VARCHAR(50) NOT NULL DEFAULT 'AKTIV',
    data_regjistrimit DATETIME NOT NULL,
    CONSTRAINT enrollments_statusi_check CHECK (statusi IN ('AKTIV', 'PERFUNDUAR', 'ANULUAR')),
    CONSTRAINT enrollments_user_fk FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT enrollments_course_fk FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT NOT NULL UNIQUE,
    data_leshimit DATETIME NOT NULL,
    kodi_unik VARCHAR(255) NOT NULL UNIQUE,
    CONSTRAINT certificates_enrollment_fk FOREIGN KEY (enrollment_id) REFERENCES enrollments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token TEXT NOT NULL,
    expires DATETIME NOT NULL,
    created DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT refresh_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    claim_type VARCHAR(255) NOT NULL,
    claim_value VARCHAR(255) NOT NULL,
    CONSTRAINT user_claims_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    login_provider VARCHAR(255) NOT NULL,
    token_name VARCHAR(255) NOT NULL,
    token_value TEXT NOT NULL,
    CONSTRAINT user_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT user_roles_user_fk FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_roles_role_fk FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courses_teacher_id ON courses (teacher_id);
CREATE INDEX idx_courses_category_id ON courses (category_id);
CREATE INDEX idx_modules_course_id ON modules (course_id);
CREATE INDEX idx_lessons_module_id ON lessons (module_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes (lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers (question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_assignments_lesson_id ON assignments (lesson_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions (assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions (student_id);
CREATE INDEX idx_enrollments_user_id ON enrollments (user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments (course_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_user_claims_user_id ON user_claims (user_id);
CREATE INDEX idx_user_tokens_user_id ON user_tokens (user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);

CREATE INDEX idx_courses_teacher_id ON courses (teacher_id);
CREATE INDEX idx_courses_category_id ON courses (category_id);
CREATE INDEX idx_modules_course_id ON modules (course_id);
CREATE INDEX idx_lessons_module_id ON lessons (module_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes (lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers (question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_assignments_lesson_id ON assignments (lesson_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions (assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions (student_id);
CREATE INDEX idx_enrollments_user_id ON enrollments (user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments (course_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_user_claims_user_id ON user_claims (user_id);
CREATE INDEX idx_user_tokens_user_id ON user_tokens (user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
