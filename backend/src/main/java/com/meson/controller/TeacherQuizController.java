package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.TeacherQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherQuizController {

    private final TeacherQuizService teacherQuizService;

    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<List<QuizResponse>> getQuizzesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(teacherQuizService.getQuizzesByLesson(lessonId));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherQuizService.createQuiz(request));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(teacherQuizService.updateQuiz(id, request));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        teacherQuizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestionsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(teacherQuizService.getQuestionsByQuiz(quizId));
    }

    @PostMapping("/questions")
    public ResponseEntity<QuizQuestionResponse> createQuestion(@Valid @RequestBody QuizQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherQuizService.createQuestion(request));
    }

    @PostMapping("/questions/{questionId}/answers")
    public ResponseEntity<QuizAnswerResponse> addAnswer(
            @PathVariable Long questionId,
            @Valid @RequestBody QuizAnswerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherQuizService.addAnswer(questionId, request));
    }
}
