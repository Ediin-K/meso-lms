CREATE TABLE IF NOT EXISTS lesson_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emri_origjinal VARCHAR(255) NOT NULL,
    emri_ruajtur VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    tipi VARCHAR(100),
    madhesia BIGINT,
    lesson_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
