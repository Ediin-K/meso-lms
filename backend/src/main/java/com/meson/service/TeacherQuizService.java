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
    private final QuizAttemptRepository attemptRepository;
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
                .pershkrimi(request.getPershkrimi())
                .kohezgjatjaMinuta(request.getKohezgjatjaMinuta())
                .publikuar(Boolean.TRUE.equals(request.getPublikuar()))
                .lesson(lesson)
                .build();

        Quiz saved = quizRepository.save(quiz);
        saveNestedQuestions(saved, request.getQuestions());
        return toQuizResponse(saved);
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kuiz ose kuizi nuk ekziston."));

        quiz.setTitulli(request.getTitulli());
        quiz.setPershkrimi(request.getPershkrimi());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());
        if (request.getPublikuar() != null) {
            quiz.setPublikuar(request.getPublikuar());
        }

        return toQuizResponse(quizRepository.save(quiz));
    }

    public QuizResponse publishQuiz(Long id) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz ose kuizi nuk ekziston."));
        quiz.setPublikuar(true);
        return toQuizResponse(quizRepository.save(quiz));
    }

    public List<QuizAttemptResponse> getResults(Long quizId) {
        User teacher = getCurrentUser();
        quizRepository.findByIdAndLessonModuleCourseTeacherId(quizId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz ose kuizi nuk ekziston."));

        return attemptRepository.findByQuizIdOrderBySubmittedAtDesc(quizId).stream()
                .filter(attempt -> Boolean.TRUE.equals(attempt.getSubmitted()))
                .map(this::toAttemptResponse)
                .toList();
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
                .pershkrimi(quiz.getPershkrimi())
                .kohezgjatjaMinuta(quiz.getKohezgjatjaMinuta())
                .publikuar(quiz.getPublikuar())
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

    private void saveNestedQuestions(Quiz quiz, List<QuizQuestionWithOptionsRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }
        int order = 1;
        for (QuizQuestionWithOptionsRequest request : requests) {
            if (request.getOptions() == null || request.getOptions().size() != 4) {
                throw new RuntimeException("Cdo pyetje duhet te kete saktesisht 4 alternativa.");
            }
            boolean hasCorrect = request.getOptions().stream().anyMatch(o -> Boolean.TRUE.equals(o.getEshteSakte()));
            if (!hasCorrect) {
                throw new RuntimeException("Cdo pyetje duhet te kete te pakten nje pergjigje te sakte.");
            }
            QuizQuestion question = QuizQuestion.builder()
                    .pyetja(request.getPyetja())
                    .lloji(QuizType.SHUMEFISHTE)
                    .rradhitja(order++)
                    .quiz(quiz)
                    .build();
            QuizQuestion savedQuestion = questionRepository.save(question);
            for (QuizOptionRequest option : request.getOptions()) {
                answerRepository.save(QuizAnswer.builder()
                        .pergjigja(option.getPergjigja())
                        .eshteSakte(Boolean.TRUE.equals(option.getEshteSakte()))
                        .question(savedQuestion)
                        .build());
            }
        }
    }

    private QuizAttemptResponse toAttemptResponse(QuizAttempt attempt) {
        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitulli(attempt.getQuiz().getTitulli())
                .userId(attempt.getUser().getId())
                .userEmri(attempt.getUser().getEmri() + " " + attempt.getUser().getMbiemri())
                .pikete(attempt.getPikete())
                .kohaSekondat(attempt.getKohaSekondat())
                .data(attempt.getData())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .submittedAt(attempt.getSubmittedAt())
                .submitted(attempt.getSubmitted())
                .build();
    }
}
