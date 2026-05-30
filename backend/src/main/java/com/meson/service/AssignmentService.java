package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

   
    public List<AssignmentResponse> getAll() {
        return assignmentRepository.findAll()
                .stream().map(this::toAssignmentResponse).toList();
    }

    public AssignmentResponse getById(Long id) {
        return toAssignmentResponse(assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet")));
    }

    public List<AssignmentResponse> getByLessonId(Long lessonId) {
        return assignmentRepository.findByLessonId(lessonId)
                .stream().map(this::toAssignmentResponse).toList();
    }

    public AssignmentResponse create(AssignmentRequest request) {
        if (assignmentRepository.existsByTitulliAndLessonId(request.getTitulli(), request.getLessonId())) {
            throw new RuntimeException("Detyra tashmë ekziston në këtë leksion");
        }

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));

        Assignment assignment = new Assignment();
        assignment.setTitulli(request.getTitulli());
        assignment.setPershkrimi(request.getPershkrimi());
        assignment.setResourceUrl(request.getResourceUrl());
        assignment.setDeadline(request.getDeadline());
        assignment.setStatusi(request.getStatusi());
        assignment.setLesson(lesson);

        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse update(Long id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet"));

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));

        assignment.setTitulli(request.getTitulli());
        assignment.setPershkrimi(request.getPershkrimi());
        assignment.setResourceUrl(request.getResourceUrl());
        assignment.setDeadline(request.getDeadline());
        assignment.setStatusi(request.getStatusi());
        assignment.setLesson(lesson);

        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    public void delete(Long id) {
        if (!assignmentRepository.existsById(id))
            throw new RuntimeException("Detyra nuk u gjet");
        assignmentRepository.deleteById(id);
    }

    // SUBMISSION
    public List<AssignmentSubmissionResponse> getSubmissionsByAssignmentId(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId)
                .stream().map(this::toSubmissionResponse).toList();
    }

    public List<AssignmentSubmissionResponse> getSubmissionsByStudentId(Long studentId) {
        return submissionRepository.findByStudentId(studentId)
                .stream().map(this::toSubmissionResponse).toList();
    }

    public AssignmentSubmissionResponse createSubmission(AssignmentSubmissionRequest request) {
        if (submissionRepository.existsByAssignmentIdAndStudentId(request.getAssignmentId(), request.getStudentId())) {
            throw new RuntimeException("Studenti e ka dorezuar tashme kete detyre");
        }

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet"));

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));

        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmissionUrl(request.getSubmissionUrl());
        submission.setPershkrimi(request.getPershkrimi());

        return toSubmissionResponse(submissionRepository.save(submission));
    }

    public AssignmentSubmissionResponse gradeSubmission(Long id, Double nota) {
        AssignmentSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dorezimi nuk u gjet"));
        submission.setNota(nota);
        submission.setStatusi(SubmissionStatus.VLERESUAR);
        return toSubmissionResponse(submissionRepository.save(submission));
    }

    public void deleteSubmission(Long id) {
        if (!submissionRepository.existsById(id))
            throw new RuntimeException("Dorezimi nuk u gjet");
        submissionRepository.deleteById(id);
    }

    private AssignmentResponse toAssignmentResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .titulli(a.getTitulli())
                .pershkrimi(a.getPershkrimi())
                .resourceUrl(a.getResourceUrl())
                .deadline(a.getDeadline())
                .statusi(a.getStatusi())
                .lessonId(a.getLesson().getId())
                .lessonTitulli(a.getLesson().getTitulli())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AssignmentSubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
        return AssignmentSubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitulli(s.getAssignment().getTitulli())
                .studentId(s.getStudent().getId())
                .studentEmri(s.getStudent().getEmri())
                .submissionUrl(s.getSubmissionUrl())
                .pershkrimi(s.getPershkrimi())
                .nota(s.getNota())
                .statusi(s.getStatusi())
                .submittedAt(s.getSubmittedAt())
                .build();
    }
}