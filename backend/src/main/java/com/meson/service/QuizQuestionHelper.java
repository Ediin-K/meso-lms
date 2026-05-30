package com.meson.service;

import com.meson.dto.QuizOptionRequest;
import com.meson.dto.QuizQuestionWithOptionsRequest;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.repository.QuizAnswerRepository;
import com.meson.repository.QuizQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QuizQuestionHelper {

    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;

    public void saveNestedQuestions(Quiz quiz, List<QuizQuestionWithOptionsRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }
        int order = 1;
        for (QuizQuestionWithOptionsRequest request : requests) {
            validateQuestion(request);
            QuizType lloji = request.getLloji() != null ? request.getLloji() : QuizType.SHUMEFISHTE;
            QuizQuestion question = QuizQuestion.builder()
                    .quiz(quiz)
                    .pyetja(request.getPyetja())
                    .lloji(lloji)
                    .pikete(request.getPikete() != null ? request.getPikete() : 1)
                    .rradhitja(order++)
                    .build();
            QuizQuestion savedQuestion = questionRepository.save(question);
            for (QuizOptionRequest option : request.getOptions()) {
                answerRepository.save(QuizAnswer.builder()
                        .question(savedQuestion)
                        .pergjigja(option.getPergjigja())
                        .eshteSakte(Boolean.TRUE.equals(option.getEshteSakte()))
                        .build());
            }
        }
    }

    public void replaceQuestions(Quiz quiz, List<QuizQuestionWithOptionsRequest> requests) {
        questionRepository.deleteAllByQuizId(quiz.getId());
        saveNestedQuestions(quiz, requests);
    }

    public void validateQuestion(QuizQuestionWithOptionsRequest request) {
        QuizType lloji = request.getLloji() != null ? request.getLloji() : QuizType.SHUMEFISHTE;
        List<QuizOptionRequest> options = request.getOptions();

        if (options == null || options.isEmpty()) {
            throw new BadRequestException("Cdo pyetje duhet te kete alternativa.");
        }

        if (QuizType.VERTET_GABIM.equals(lloji)) {
            if (options.size() != 2) {
                throw new BadRequestException("Pyetjet Vertet/Gabim duhet te kene saktesisht 2 alternativa.");
            }
        } else if (QuizType.SHUMEFISHTE.equals(lloji)) {
            if (options.size() != 4) {
                throw new BadRequestException("Pyetjet me shume alternative duhet te kene saktesisht 4 alternativa.");
            }
        } else {
            throw new BadRequestException("Lloji i pyetjes nuk mbështetet.");
        }

        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getEshteSakte())).count();
        if (correctCount != 1) {
            throw new BadRequestException("Cdo pyetje duhet te kete saktesisht nje pergjigje te sakte.");
        }

        if (request.getPikete() == null || request.getPikete() < 1) {
            throw new BadRequestException("Cdo pyetje duhet te kete te pakten 1 pike.");
        }
    }

    public int calculateTotalPoints(Long quizId) {
        return questionRepository.findByQuizIdOrderByRradhitjaAsc(quizId).stream()
                .mapToInt(q -> q.getPikete() != null ? q.getPikete() : 1)
                .sum();
    }
}
