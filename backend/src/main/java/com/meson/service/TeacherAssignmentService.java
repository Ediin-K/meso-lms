package com.meson.service;

import com.meson.dto.AssignmentRequest;
import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
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
public class TeacherAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public List<AssignmentResponse> getAssignmentsByLesson(Long lessonId) {
        User teacher = getCurrentUser();
        lessonRepository.findByIdAndModuleCourseTeacherId(lessonId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        return assignmentRepository.findByLessonId(lessonId).stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    public AssignmentResponse createAssignment(AssignmentRequest request) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(request.getLessonId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        Assignment assignment = Assignment.builder()
                .titulli(request.getTitulli())
                .pershkrimi(request.getPershkrimi())
                .resourceUrl(request.getResourceUrl())
                .deadline(request.getDeadline())
                .statusi(request.getStatusi())
                .lesson(lesson)
                .build();

        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request) {
        User teacher = getCurrentUser();
        Assignment assignment = assignmentRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë detyrë ose detyra nuk ekziston."));

        assignment.setTitulli(request.getTitulli());
        assignment.setPershkrimi(request.getPershkrimi());
        assignment.setResourceUrl(request.getResourceUrl());
        assignment.setDeadline(request.getDeadline());
        assignment.setStatusi(request.getStatusi());

        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void deleteAssignment(Long id) {
        User teacher = getCurrentUser();
        Assignment assignment = assignmentRepository.findByIdAndLessonModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë detyrë ose detyra nuk ekziston."));

        assignmentRepository.delete(assignment);
    }

    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        User teacher = getCurrentUser();
        assignmentRepository.findByIdAndLessonModuleCourseTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë detyrë ose detyra nuk ekziston."));

        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentSubmissionResponse gradeSubmission(Long submissionId, Double nota, String statusi) {
        User teacher = getCurrentUser();
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Dorezimi nuk u gjet."));

        assignmentRepository.findByIdAndLessonModuleCourseTeacherId(submission.getAssignment().getId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë dërgim."));

        submission.setNota(nota);
        if (statusi != null) {
            submission.setStatusi(SubmissionStatus.valueOf(statusi));
        }

        return toSubmissionResponse(submissionRepository.save(submission));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private AssignmentResponse toAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .titulli(assignment.getTitulli())
                .pershkrimi(assignment.getPershkrimi())
                .resourceUrl(assignment.getResourceUrl())
                .deadline(assignment.getDeadline())
                .statusi(assignment.getStatusi())
                .lessonId(assignment.getLesson().getId())
                .lessonTitulli(assignment.getLesson().getTitulli())
                .createdAt(assignment.getCreatedAt())
                .build();
    }

    private AssignmentSubmissionResponse toSubmissionResponse(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .studentId(submission.getStudent().getId())
                .studentEmri(submission.getStudent().getEmri() + " " + submission.getStudent().getMbiemri())
                .submissionUrl(submission.getSubmissionUrl())
                .pershkrimi(submission.getPershkrimi())
                .nota(submission.getNota())
                .statusi(submission.getStatusi())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}
