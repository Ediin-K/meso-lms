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

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuizAttemptRepository attemptRepository;
    private final AnswerSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final QuizQuestionHelper questionHelper;

    public List<QuizResponse> getAll() {
        return quizRepository.findByStatus(QuizStatus.ACTIVE).stream()
                .map(this::toQuizResponse).toList();
    }

    public QuizResponse getById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));
        if (!QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new AccessDeniedException("Kuizi nuk eshte aktiv.");
        }
        return toQuizResponse(quiz);
    }

    public List<QuizResponse> getByLessonId(Long lessonId) {
        return quizRepository.findByLessonIdAndStatus(lessonId, QuizStatus.ACTIVE).stream()
                .map(this::toQuizResponse).toList();
    }

    public QuizAttemptStudentResponse getMyAttemptForQuiz(Long quizId) {
        User student = getCurrentUser();
        return attemptRepository.findFirstByQuizIdAndUserId(quizId, student.getId())
                .map(this::toAttemptResponseForStudent)
                .orElse(null);
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Leksioni nuk u gjet"));
        Quiz quiz = new Quiz();
        quiz.setTitulli(request.getTitulli());
        quiz.setPershkrimi(request.getPershkrimi());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());
        quiz.setStatus(QuizStatus.DRAFT);
        quiz.setLesson(lesson);
        Quiz saved = quizRepository.save(quiz);
        questionHelper.saveNestedQuestions(saved, request.getQuestions());
        return toQuizResponse(saved);
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));
        if (!QuizStatus.DRAFT.equals(quiz.getStatus())) {
            throw new BadRequestException("Mund te modifikohet vetem kuizi ne gjendje DRAFT.");
        }
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Leksioni nuk u gjet"));
        quiz.setTitulli(request.getTitulli());
        quiz.setPershkrimi(request.getPershkrimi());
        quiz.setKohezgjatjaMinuta(request.getKohezgjatjaMinuta());
        quiz.setLesson(lesson);
        if (request.getQuestions() != null) {
            questionHelper.replaceQuestions(quiz, request.getQuestions());
        }
        return toQuizResponse(quizRepository.save(quiz));
    }

    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Kuizi nuk u gjet");
        }
        quizRepository.deleteById(id);
    }

    public List<QuizQuestionResponse> getQuestionsByQuizId(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));
        if (!QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new AccessDeniedException("Kuizi nuk eshte aktiv.");
        }
        return questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId)
                .stream().map(this::toQuestionResponse).toList();
    }

    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));
        QuizQuestion question = new QuizQuestion();
        question.setPyetja(request.getPyetja());
        question.setLloji(request.getLloji());
        question.setRradhitja(request.getRradhitja());
        question.setPikete(request.getPikete() != null ? request.getPikete() : 1);
        question.setQuiz(quiz);
        return toQuestionResponse(questionRepository.save(question));
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pyetja nuk u gjet");
        }
        questionRepository.deleteById(id);
    }

    public List<QuizAnswerResponse> getAnswersByQuestionId(Long questionId) {
        return answerRepository.findByQuestionId(questionId)
                .stream().map(this::toAnswerResponse).toList();
    }

    public QuizAnswerResponse createAnswer(QuizAnswerRequest request) {
        QuizQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Pyetja nuk u gjet"));
        QuizAnswer answer = new QuizAnswer();
        answer.setPergjigja(request.getPergjigja());
        answer.setEshteSakte(request.getEshteSakte());
        answer.setQuestion(question);
        return toAnswerResponse(answerRepository.save(answer));
    }

    public void deleteAnswer(Long id) {
        if (!answerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pergjigja nuk u gjet");
        }
        answerRepository.deleteById(id);
    }

    public List<QuizAttemptResponse> getAttemptsByQuizId(Long quizId) {
        return attemptRepository.findByQuizId(quizId)
                .stream().map(this::toAttemptResponse).toList();
    }

    public List<QuizAttemptResponse> getAttemptsByUserId(Long userId) {
        return attemptRepository.findByUserId(userId)
                .stream().map(this::toAttemptResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptStudentResponse> getAttemptsByUserIdForStudent(Long userId) {
        return attemptRepository.findByUserId(userId)
                .stream()
                .map(this::toAttemptResponseForStudent)
                .toList();
    }

    public QuizAttemptResponse createAttempt(QuizAttemptRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));
        LocalDateTime now = LocalDateTime.now();
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(user)
                .pikete(request.getPikete())
                .kohaSekondat(request.getKohaSekondat())
                .startedAt(now)
                .expiresAt(now.plusSeconds(Math.max(1, request.getKohaSekondat())))
                .submitted(true)
                .submittedAt(now)
                .abandoned(false)
                .build();
        return toAttemptResponse(attemptRepository.save(attempt));
    }

    @Transactional
    public QuizStartResponse startQuiz(Long quizId) {
        User student = getCurrentUser();
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuizi nuk u gjet"));

        if (!QuizStatus.ACTIVE.equals(quiz.getStatus())) {
            throw new AccessDeniedException("Kuizi nuk eshte i hapur per studente. Prisni mesuesin ta aktivizoje.");
        }

        Optional<QuizAttempt> existing = attemptRepository.findFirstByQuizIdAndUserId(quizId, student.getId());
        if (existing.isPresent()) {
            QuizAttempt attempt = existing.get();
            if (Boolean.TRUE.equals(attempt.getAbandoned())) {
                throw new BadRequestException("Ke braktisur kete kuiz. Nuk mund ta rifillosh.");
            }
            if (Boolean.TRUE.equals(attempt.getSubmitted())) {
                throw new BadRequestException("Ky kuiz eshte dorezuar tashme.");
            }
            if (!LocalDateTime.now().isBefore(attempt.getExpiresAt())) {
                submitExpiredAttempt(attempt);
                throw new BadRequestException("Koha e kuizit ka perfunduar. Kuizi u dorezua automatikisht.");
            }
            return toStartResponse(attempt);
        }

        LocalDateTime now = LocalDateTime.now();
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(student)
                .pikete(0.0)
                .kohaSekondat(0)
                .startedAt(now)
                .expiresAt(now.plusMinutes(quiz.getKohezgjatjaMinuta()))
                .submitted(false)
                .abandoned(false)
                .build();

        return toStartResponse(attemptRepository.save(attempt));
    }

    @Transactional
    public QuizSubmitResponse submitQuiz(Long quizId, QuizSubmitRequest request) {
        User student = getCurrentUser();
        QuizAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt nuk u gjet"));

        if (!attempt.getQuiz().getId().equals(quizId) || !attempt.getUser().getId().equals(student.getId())) {
            throw new AccessDeniedException("Attempt nuk i perket ketij perdoruesi.");
        }
        if (Boolean.TRUE.equals(attempt.getSubmitted())) {
            throw new BadRequestException("Ky kuiz eshte dorezuar tashme.");
        }
        if (Boolean.TRUE.equals(attempt.getAbandoned())) {
            throw new BadRequestException("Ke braktisur kete kuiz.");
        }

        LocalDateTime now = LocalDateTime.now();
        List<QuestionSubmissionRequest> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : List.of();
        submissionRepository.deleteByAttemptId(attempt.getId());
        double score = calculateAndStoreScore(attempt, submittedAnswers);

        attempt.setPikete(score);
        attempt.setKohaSekondat((int) Duration.between(attempt.getStartedAt(), now).toSeconds());
        attempt.setSubmitted(true);
        attempt.setSubmittedAt(now);
        attemptRepository.save(attempt);

        return QuizSubmitResponse.builder()
                .attemptId(attempt.getId())
                .submitted(true)
                .message("Kuizi u dorezua me sukses.")
                .pikete(score)
                .courseId(getCourseIdFromQuiz(attempt.getQuiz()))
                .build();
    }

    @Transactional
    public void abandonQuiz(Long quizId, Long attemptId) {
        throw new BadRequestException("Braktisja e kuizit nuk lejohet.");
    }

    public List<QuizAnswerStudentResponse> getAnswersByQuestionIdForStudent(Long questionId) {
        return answerRepository.findByQuestionId(questionId)
                .stream()
                .map(a -> QuizAnswerStudentResponse.builder()
                        .id(a.getId())
                        .pergjigja(a.getPergjigja())
                        .questionId(a.getQuestion().getId())
                        .build())
                .toList();
    }

    private void saveNestedQuestions(Quiz quiz, List<QuizQuestionWithOptionsRequest> requests) {
        questionHelper.saveNestedQuestions(quiz, requests);
    }

    private void validateOptions(QuizQuestionWithOptionsRequest request) {
        questionHelper.validateQuestion(request);
    }

    private double calculateAndStoreScore(QuizAttempt attempt, List<QuestionSubmissionRequest> submittedAnswers) {
        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByRradhitjaAsc(attempt.getQuiz().getId());
        Map<Long, Set<Long>> selectedByQuestion = submittedAnswers.stream()
                .filter(a -> a.getQuestionId() != null)
                .collect(Collectors.toMap(
                        QuestionSubmissionRequest::getQuestionId,
                        a -> a.getAnswerIds() == null ? Set.of() : new HashSet<>(a.getAnswerIds()),
                        (left, right) -> left
                ));

        int totalPoints = 0;
        int earnedPoints = 0;

        for (QuizQuestion question : questions) {
            int questionPoints = question.getPikete() != null ? question.getPikete() : 1;
            totalPoints += questionPoints;

            Set<Long> correctIds = answerRepository.findByQuestionId(question.getId()).stream()
                    .filter(a -> Boolean.TRUE.equals(a.getEshteSakte()))
                    .map(QuizAnswer::getId)
                    .collect(Collectors.toSet());
            Set<Long> selectedIds = selectedByQuestion.getOrDefault(question.getId(), Set.of());

            for (Long answerId : selectedIds) {
                QuizAnswer answer = answerRepository.findById(answerId)
                        .orElseThrow(() -> new BadRequestException("Pergjigje e pavlefshme."));
                if (!answer.getQuestion().getId().equals(question.getId())) {
                    throw new BadRequestException("Pergjigja nuk i perket pyetjes.");
                }
                submissionRepository.save(AnswerSubmission.builder()
                        .attempt(attempt)
                        .question(question)
                        .answer(answer)
                        .build());
            }

            if (!correctIds.isEmpty() && correctIds.equals(selectedIds)) {
                earnedPoints += questionPoints;
            }
        }

        return totalPoints == 0 ? 0.0 : (earnedPoints * 100.0) / totalPoints;
    }

    private void submitExpiredAttempt(QuizAttempt attempt) {
        attempt.setPikete(0.0);
        attempt.setKohaSekondat((int) Duration.between(attempt.getStartedAt(), attempt.getExpiresAt()).toSeconds());
        attempt.setSubmitted(true);
        attempt.setSubmittedAt(attempt.getExpiresAt());
        attemptRepository.save(attempt);
    }

    private QuizStartResponse toStartResponse(QuizAttempt attempt) {
        LocalDateTime now = LocalDateTime.now();
        int remaining = Math.max(0, (int) Duration.between(now, attempt.getExpiresAt()).toSeconds());
        return QuizStartResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .titulli(attempt.getQuiz().getTitulli())
                .pershkrimi(attempt.getQuiz().getPershkrimi())
                .kohezgjatjaMinuta(attempt.getQuiz().getKohezgjatjaMinuta())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .remainingSeconds(remaining)
                .courseId(getCourseIdFromQuiz(attempt.getQuiz()))
                .totalPikete(questionHelper.calculateTotalPoints(attempt.getQuiz().getId()))
                .questions(questionRepository.findByQuizIdOrderByRradhitjaAsc(attempt.getQuiz().getId()).stream()
                        .map(this::toQuestionForAttempt)
                        .toList())
                .build();
    }

    private QuizQuestionForAttemptResponse toQuestionForAttempt(QuizQuestion question) {
        return QuizQuestionForAttemptResponse.builder()
                .id(question.getId())
                .pyetja(question.getPyetja())
                .lloji(question.getLloji())
                .rradhitja(question.getRradhitja())
                .pikete(question.getPikete())
                .answers(getAnswersByQuestionIdForStudent(question.getId()))
                .build();
    }

    private Long getCourseIdFromQuiz(Quiz quiz) {
        if (quiz.getLesson() == null || quiz.getLesson().getModule() == null || quiz.getLesson().getModule().getCourse() == null) {
            return null;
        }
        return quiz.getLesson().getModule().getCourse().getId();
    }

    public Long getCurrentStudentId() {
        return getCurrentUser().getId();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet."));
    }

    public QuizResponse toQuizResponse(Quiz quiz) {
        long questionCount = questionRepository.countByQuizId(quiz.getId());
        return QuizResponse.builder()
                .id(quiz.getId())
                .titulli(quiz.getTitulli())
                .pershkrimi(quiz.getPershkrimi())
                .kohezgjatjaMinuta(quiz.getKohezgjatjaMinuta())
                .status(quiz.getStatus())
                .publikuar(QuizStatus.ACTIVE.equals(quiz.getStatus()))
                .lessonId(quiz.getLesson().getId())
                .lessonTitulli(quiz.getLesson().getTitulli())
                .createdAt(quiz.getCreatedAt())
                .activatedAt(quiz.getActivatedAt())
                .closedAt(quiz.getClosedAt())
                .courseId(getCourseIdFromQuiz(quiz))
                .questionCount((int) questionCount)
                .totalPikete(questionHelper.calculateTotalPoints(quiz.getId()))
                .build();
    }

    private QuizQuestionResponse toQuestionResponse(QuizQuestion q) {
        return QuizQuestionResponse.builder()
                .id(q.getId())
                .pyetja(q.getPyetja())
                .lloji(q.getLloji())
                .rradhitja(q.getRradhitja())
                .pikete(q.getPikete())
                .quizId(q.getQuiz().getId())
                .build();
    }

    private QuizAnswerResponse toAnswerResponse(QuizAnswer a) {
        return QuizAnswerResponse.builder()
                .id(a.getId())
                .pergjigja(a.getPergjigja())
                .eshteSakte(a.getEshteSakte())
                .questionId(a.getQuestion().getId())
                .build();
    }

    public QuizAttemptResponse toAttemptResponse(QuizAttempt at) {
        return QuizAttemptResponse.builder()
                .id(at.getId())
                .quizId(at.getQuiz().getId())
                .quizTitulli(at.getQuiz().getTitulli())
                .userId(at.getUser().getId())
                .userEmri(at.getUser().getEmri() + " " + at.getUser().getMbiemri())
                .pikete(at.getPikete())
                .kohaSekondat(at.getKohaSekondat())
                .data(at.getData())
                .startedAt(at.getStartedAt())
                .expiresAt(at.getExpiresAt())
                .submittedAt(at.getSubmittedAt())
                .submitted(at.getSubmitted())
                .abandoned(at.getAbandoned())
                .abandonedAt(at.getAbandonedAt())
                .attemptStatus(at.getAttemptStatus())
                .build();
    }

    private QuizAttemptStudentResponse toAttemptResponseForStudent(QuizAttempt at) {
        boolean submitted = Boolean.TRUE.equals(at.getSubmitted());
        return QuizAttemptStudentResponse.builder()
                .id(at.getId())
                .quizId(at.getQuiz().getId())
                .quizTitulli(at.getQuiz().getTitulli())
                .startedAt(at.getStartedAt())
                .expiresAt(at.getExpiresAt())
                .submittedAt(at.getSubmittedAt())
                .submitted(submitted)
                .attemptStatus(at.getAttemptStatus())
                .pikete(submitted ? at.getPikete() : null)
                .build();
    }
}
