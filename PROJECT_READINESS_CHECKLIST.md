# Project Readiness Checklist

Use this checklist before the final presentation.

## Implemented In Code

- Spring Boot backend
- React frontend
- MySQL relational database
- Flyway migrations
- JWT authentication
- Refresh token flow
- Role-based authorization
- Admin dashboard
- Teacher dashboard
- Student dashboard
- CRUD for core LMS entities
- File upload/download
- Assignment workflow
- Quiz workflow
- Swagger/OpenAPI documentation
- Route-level frontend lazy loading
- Environment variable support for API URL and JWT settings

## Must Be Prepared By The Team

- Moodle project selection proof
- Trello board link or screenshots
- Individual explanation of each member's commits
- Live coding readiness
- Manual browser testing proof
- Final presentation demo script

## Manual Demo Flow

1. Login as admin and show admin dashboard.
2. Create or manage users/courses/categories.
3. Login as teacher and show teacher dashboard.
4. Create module and lesson.
5. Upload a lesson resource.
6. Create and publish a quiz.
7. Login as student.
8. Open published quiz.
9. Submit quiz.
10. Login as teacher and show quiz results.
11. Open Swagger UI and show documented APIs.
12. Show MySQL schema/migrations.
13. Show Git contributors.
14. Show Trello board.

## Known Presentation Notes

- JWT tokens are stored in localStorage for this academic implementation.
- In production, JWT and refresh token storage should be hardened with HTTPS and secure cookies.
- `JWT_SECRET` should be provided as an environment variable outside source control.
- File resource download/view endpoints are public to support lesson material access from public course pages.
