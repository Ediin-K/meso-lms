# Meson LMS

Meson LMS is a full-stack Learning Management System built with Spring Boot, React, and MySQL. The system supports role-based access for administrators, teachers, and students, including course management, modules, lessons, file resources, assignments, schedules, student groups, certificates, and a complete quiz workflow.

## Technologies

### Backend
- Java 21
- Spring Boot 3.4
- Spring Web
- Spring Security
- JWT authentication
- Spring Data JPA
- Flyway database migrations
- MySQL
- Swagger/OpenAPI with Springdoc

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Material UI
- Recharts

### Database
- MySQL relational database
- Flyway migrations in `backend/src/main/resources/db/migration`
- Foreign keys, indexes, and constraints are defined in SQL migrations

## Main Features

- Authentication with JWT and refresh tokens
- Role-based authorization for `ADMIN`, `TEACHER`, and `STUDENT`
- Admin dashboard
- Teacher dashboard
- Student dashboard
- Course CRUD
- Category CRUD
- Module CRUD
- Lesson CRUD
- File upload, preview, and download for lesson resources
- Assignment creation, submission, and grading
- Quiz creation, publishing, timed attempts, automatic backend scoring, and teacher results dashboard
- Schedule and student group management
- Certificate management
- Notifications and profile pages
- Cookie/privacy consent UI

## Project Structure

```text
meson-lms/
  backend/
    src/main/java/com/meson/
      config/
      controller/
      dto/
      entity/
      exception/
      repository/
      service/
    src/main/resources/
      application.properties
      db/migration/
  frontend/
    src/
      components/
      context/
      layouts/
      pages/
      services/
      utils/
```

## Requirements

- Java 21
- Maven
- Node.js 20+
- MySQL 8+

## Environment Configuration

Copy `.env.example` and configure values for your machine.

Backend reads these values from environment variables:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=meson_lms
DB_USER=root
DB_PASSWORD=
JWT_SECRET=base64-secret
JWT_EXPIRATION=86400000
```

Frontend reads:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

For local development, default values are already provided in `application.properties`.

## Running The Backend

Create the MySQL database first:

```sql
CREATE DATABASE meson_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then start the backend:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

Flyway automatically applies migrations on startup.

## Running The Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Swagger / OpenAPI

Swagger UI is enabled for API documentation and testing:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

For protected endpoints:

1. Call `POST /api/auth/login`.
2. Copy the returned JWT token.
3. Click `Authorize` in Swagger.
4. Paste the token in the Bearer JWT field.

## Important API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT + refresh token |
| POST | `/api/auth/refresh` | Refresh expired JWT |

### Courses And Lessons

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Public course list |
| GET | `/api/courses/{id}` | Course details |
| GET | `/api/courses/{courseId}/modules` | Course modules |
| GET | `/api/modules/{moduleId}/lessons` | Module lessons |
| GET | `/api/resources/{id}/download` | Download lesson resource |
| GET | `/api/resources/{id}/view` | Preview lesson resource |

### Teacher Content

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teacher/courses` | Teacher courses |
| POST | `/api/teacher/modules` | Create module |
| POST | `/api/teacher/lessons` | Create lesson |
| POST | `/api/teacher/files/upload/lesson/{lessonId}` | Upload lesson file |
| POST | `/api/teacher/quizzes` | Create quiz |
| POST | `/api/teacher/quizzes/{id}/publish` | Publish quiz |
| GET | `/api/teacher/quizzes/{id}/results` | Quiz results for teacher |

### Quiz System

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/quizzes` | Student | List published quizzes |
| POST | `/api/quizzes/{id}/start` | Student | Start timed attempt |
| POST | `/api/quizzes/{id}/submit` | Student | Submit answers |
| GET | `/api/teacher/quizzes/{id}/results` | Teacher | View student scores |

Quiz scoring is calculated in the backend. Students do not receive the answer key and do not see their individual score after submission.

## Security

- JWT is used for API authentication.
- Refresh tokens are supported.
- Protected frontend routes use role checks.
- Backend endpoints use Spring Security and `@PreAuthorize` where needed.
- Passwords are hashed with BCrypt.
- CORS is restricted to local frontend development origins.
- Production deployments should provide `JWT_SECRET` through environment variables and use HTTPS.

## Database Design

The main entities include:

- `users`
- `roles`
- `user_roles`
- `courses`
- `course_categories`
- `modules`
- `lessons`
- `lesson_resources`
- `quizzes`
- `quiz_questions`
- `quiz_answers`
- `quiz_attempts`
- `answer_submissions`
- `assignments`
- `assignment_submissions`
- `enrollments`
- `certificates`
- `schedule_sessions`
- `course_groups`
- `course_subgroups`
- `student_group_requests`

Migrations include indexes and foreign key constraints to preserve relational integrity.

## Frontend Optimization

The frontend uses route-level lazy loading with `React.lazy` and `Suspense` in `App.jsx` to reduce the initial JavaScript bundle loaded by the browser.

## Testing And Verification

Backend build and tests:

```bash
cd backend
mvn test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Git Contribution Evidence

The repository contains commits from multiple contributors. During presentation, each group member should be ready to explain their own commits and code changes.

Useful command:

```bash
git log --all --pretty=format:"%an <%ae>" | sort -u
```

## Trello Evidence

Trello is required for task management. The team should prepare:

- Board link or screenshots
- Lists such as `To Do`, `In Progress`, `Review`, `Done`
- Cards assigned to group members
- Labels for backend, frontend, database, testing, and documentation

## Presentation Checklist

- Start MySQL.
- Start backend with `mvn spring-boot:run`.
- Start frontend with `npm run dev`.
- Open Swagger UI.
- Demonstrate login for each role.
- Demonstrate dashboards.
- Demonstrate CRUD flow.
- Demonstrate teacher quiz creation and publishing.
- Demonstrate student quiz attempt and auto-submit.
- Demonstrate teacher results dashboard.
- Show database migrations and relationships.
- Show Git commits per group member.
- Show Trello board.
- Be ready for live coding changes.
