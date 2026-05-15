package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherQuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    // Quiz CRUD
    public List<QuizResponse> getQuizzesByLesson(Long lessonId) {
        User teacher = getCurrentUser();
        lessonRepository.findByIdAndModuleCourseTeacherId(lessonId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        return quizRepository.findByLessonId(lessonId).stream()
                .map(this::toQuizResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse createQuiz(QuizRequest request) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(request.getLessonId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        Quiz quiz = Quiz.builder()
                .titulli(request.getTitulli())
                .kohezgjatjaMinuta(request.getKohezgjatjaMinuta())
                .lesson(lesson)
                .build();

        return toQuizResponse(quizRepository.save(quiz));
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kuiz ose kuizi nuk ekziston."));

        quiz.setTitulli(request.getTitulli());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());

        return toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public void deleteQuiz(Long id) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kuiz ose kuizi nuk ekziston."));

        quizRepository.delete(quiz);
    }

    // Question CRUD
    public List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId) {
        User teacher = getCurrentUser();
        quizRepository.findByIdAndLessonModuleCourseTeacherId(quizId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kuiz ose kuizi nuk ekziston."));

        return questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId).stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());
    }

    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(request.getQuizId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kuiz ose kuizi nuk ekziston."));

        QuizQuestion question = QuizQuestion.builder()
                .pyetja(request.getPyetja())
                .lloji(request.getLloji())
                .rradhitja(request.getRradhitja())
                .quiz(quiz)
                .build();

        return toQuestionResponse(questionRepository.save(question));
    }

    // Answer CRUD
    @Transactional
    public QuizAnswerResponse addAnswer(Long questionId, QuizAnswerRequest request) {
        User teacher = getCurrentUser();
        // Check if question belongs to a quiz owned by the teacher
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Pyetja nuk u gjet."));
        
        quizRepository.findByIdAndLessonModuleCourseTeacherId(question.getQuiz().getId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë pyetje."));

        QuizAnswer answer = QuizAnswer.builder()
                .pergjigja(request.getPergjigja())
                .eshteSakte(request.getEshteSakte())
                .question(question)
                .build();

        return toAnswerResponse(answerRepository.save(answer));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private QuizResponse toQuizResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .titulli(quiz.getTitulli())
                .kohezgjatjaMinuta(quiz.getKohezgjatjaMinuta())
                .lessonId(quiz.getLesson().getId())
                .lessonTitulli(quiz.getLesson().getTitulli())
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizQuestionResponse toQuestionResponse(QuizQuestion question) {
        return QuizQuestionResponse.builder()
                .id(question.getId())
                .pyetja(question.getPyetja())
                .lloji(question.getLloji())
                .rradhitja(question.getRradhitja())
                .quizId(question.getQuiz().getId())
                .build();
    }

    private QuizAnswerResponse toAnswerResponse(QuizAnswer answer) {
        return QuizAnswerResponse.builder()
                .id(answer.getId())
                .pergjigja(answer.getPergjigja())
                .eshteSakte(answer.getEshteSakte())
                .questionId(answer.getQuestion().getId())
                .build();
    }
}
