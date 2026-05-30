package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final QuizService quizService;

    public List<QuizResponse> getQuizzesByLesson(Long lessonId) {
        User teacher = getCurrentUser();
        lessonRepository.findByIdAndModuleCourseTeacherId(lessonId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete leksion."));
        return quizRepository.findByLessonId(lessonId).stream()
                .map(quizService::toQuizResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(request.getLessonId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete leksion."));

        Quiz quiz = Quiz.builder()
                .titulli(request.getTitulli())
                .pershkrimi(request.getPershkrimi())
                .kohezgjatjaMinuta(request.getKohezgjatjaMinuta())
                .status(QuizStatus.DRAFT)
                .lesson(lesson)
                .build();

        Quiz saved = quizRepository.save(quiz);
        saveNestedQuestions(saved, request.getQuestions());
        return quizService.toQuizResponse(saved);
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        if (!QuizStatus.DRAFT.equals(quiz.getStatus())) {
            throw new BadRequestException("Vetem kuizet DRAFT mund te modifikohen. Mbylleni kuizin aktiv fillimisht.");
        }

        quiz.setTitulli(request.getTitulli());
        quiz.setPershkrimi(request.getPershkrimi());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());

        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse activateQuiz(Long id) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        if (QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Kuizi eshte tashme aktiv.");
        }
        if (QuizStatus.CLOSED.equals(quiz.getStatus())) {
            throw new BadRequestException("Kuizi eshte i mbyllur dhe nuk mund te rihapet.");
        }

        long questionCount = questionRepository.countByQuizId(quiz.getId());
        if (questionCount == 0) {
            throw new BadRequestException("Kuizi nuk ka pyetje. Shto pyetje para aktivizimit.");
        }

        quiz.setStatus(QuizStatus.ACTIVE);
        quiz.setActivatedAt(LocalDateTime.now());
        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse closeQuiz(Long id) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        if (!QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Mund te mbyllet vetem kuizi aktiv.");
        }

        quiz.setStatus(QuizStatus.CLOSED);
        quiz.setClosedAt(LocalDateTime.now());
        return quizService.toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse publishQuiz(Long id) {
        return activateQuiz(id);
    }

    public List<QuizAttemptResponse> getResults(Long quizId) {
        User teacher = getCurrentUser();
        quizRepository.findByIdAndLessonModuleCourseTeacherId(quizId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        return attemptRepository.findByQuizIdOrderBySubmittedAtDesc(quizId).stream()
                .filter(attempt -> Boolean.TRUE.equals(attempt.getSubmitted()))
                .map(quizService::toAttemptResponse)
                .toList();
    }

    public List<QuizAttemptResponse> getAllAttempts(Long quizId) {
        User teacher = getCurrentUser();
        quizRepository.findByIdAndLessonModuleCourseTeacherId(quizId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        return attemptRepository.findByQuizIdOrderByStartedAtDesc(quizId).stream()
                .map(quizService::toAttemptResponse)
                .toList();
    }

    @Transactional
    public void deleteQuiz(Long id) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        if (QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new BadRequestException("Nuk mund te fshihet kuizi aktiv. Mbylleni fillimisht.");
        }

        quizRepository.delete(quiz);
    }

    public List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId) {
        User teacher = getCurrentUser();
        quizRepository.findByIdAndLessonModuleCourseTeacherId(quizId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        return questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId).stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());
    }

    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        User teacher = getCurrentUser();
        Quiz quiz = quizRepository.findByIdAndLessonModuleCourseTeacherId(request.getQuizId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kuiz."));

        if (!QuizStatus.DRAFT.equals(quiz.getStatus())) {
            throw new BadRequestException("Pyetjet mund te shtohen vetem ne kuizin DRAFT.");
        }

        QuizQuestion question = QuizQuestion.builder()
                .pyetja(request.getPyetja())
                .lloji(request.getLloji())
                .rradhitja(request.getRradhitja())
                .quiz(quiz)
                .build();

        return toQuestionResponse(questionRepository.save(question));
    }

    @Transactional
    public QuizAnswerResponse addAnswer(Long questionId, QuizAnswerRequest request) {
        User teacher = getCurrentUser();
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pyetja nuk u gjet."));

        quizRepository.findByIdAndLessonModuleCourseTeacherId(question.getQuiz().getId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete pyetje."));

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
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet."));
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
        if (requests == null || requests.isEmpty()) return;
        int order = 1;
        for (QuizQuestionWithOptionsRequest request : requests) {
            if (request.getOptions() == null || request.getOptions().size() != 4) {
                throw new BadRequestException("Cdo pyetje duhet te kete saktesisht 4 alternativa.");
            }
            boolean hasCorrect = request.getOptions().stream().anyMatch(o -> Boolean.TRUE.equals(o.getEshteSakte()));
            if (!hasCorrect) {
                throw new BadRequestException("Cdo pyetje duhet te kete te pakten nje pergjigje te sakte.");
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
}
