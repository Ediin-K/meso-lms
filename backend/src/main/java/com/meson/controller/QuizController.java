package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // QUIZ
    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAll() {
        return ResponseEntity.ok(quizService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getById(id));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<QuizResponse>> getByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getByLessonId(lessonId));
    }

    @GetMapping("/questions/{questionId}/answers/student")
    public ResponseEntity<List<QuizAnswerStudentResponse>> getAnswersForStudent(@PathVariable Long questionId) {
        return ResponseEntity.ok(quizService.getAnswersByQuestionIdForStudent(questionId));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizResponse> create(@Valid @RequestBody QuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuiz(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizStartResponse> start(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.startQuiz(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizSubmitResponse> submit(
            @PathVariable Long id,
            @Valid @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(id, request));
    }

    @PostMapping("/{id}/abandon/{attemptId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> abandon(@PathVariable Long id, @PathVariable Long attemptId) {
        quizService.abandonQuiz(id, attemptId);
        return ResponseEntity.noContent().build();
    }

    // QUESTION
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuestionsByQuizId(quizId));
    }

    @PostMapping("/questions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizQuestionResponse> createQuestion(@Valid @RequestBody QuizQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuestion(request));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ANSWER
    @GetMapping("/questions/{questionId}/answers")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<QuizAnswerResponse>> getAnswers(@PathVariable Long questionId) {
        return ResponseEntity.ok(quizService.getAnswersByQuestionId(questionId));
    }

    @PostMapping("/answers")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizAnswerResponse> createAnswer(@Valid @RequestBody QuizAnswerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createAnswer(request));
    }

    @DeleteMapping("/answers/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id) {
        quizService.deleteAnswer(id);
        return ResponseEntity.noContent().build();
    }

    // ATTEMPT
    @GetMapping("/{quizId}/attempts")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizId(quizId));
    }

    @GetMapping("/attempts/user/{userId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getAttemptsByUserId(userId));
    }

    @GetMapping("/attempts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<QuizAttemptStudentResponse>> getMyAttempts() {
        return ResponseEntity.ok(quizService.getAttemptsByUserIdForStudent(quizService.getCurrentStudentId()));
    }

    @GetMapping("/attempts/student/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    public ResponseEntity<List<QuizAttemptStudentResponse>> getAttemptsForStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getAttemptsByUserIdForStudent(userId));
    }

    @PostMapping("/attempts")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizAttemptResponse> createAttempt(@Valid @RequestBody QuizAttemptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createAttempt(request));
    }
}
