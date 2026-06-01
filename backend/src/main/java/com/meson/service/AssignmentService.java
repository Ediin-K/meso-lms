package com.meson.service;

import com.meson.dto.AssignmentCreateRequest;
import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
import com.meson.entity.Assignment;
import com.meson.entity.AssignmentSubmission;
import com.meson.entity.Lesson;
import com.meson.entity.User;
import com.meson.repository.AssignmentRepository;
import com.meson.repository.AssignmentSubmissionRepository;
import com.meson.repository.LessonRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;



    public Optional<AssignmentResponse> getByLesson(Long lessonId) {
        return assignmentRepository.findByLessonId(lessonId)
                .map(this::toResponse);
    }

    public AssignmentResponse getById(Long id) {
        return toResponse(findAssignment(id));
    }

    // ── Teacher: create or update assignment for a lesson (upsert) ───────────

    public AssignmentResponse upsertForLesson(Long lessonId, LocalDateTime deadline, Long teacherId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        verifyTeacherOwnsLesson(lesson, teacherId);

        Assignment assignment = assignmentRepository.findByLessonId(lessonId)
                .orElse(Assignment.builder().lesson(lesson).build());

        assignment.setDeadline(deadline);
        return toResponse(assignmentRepository.save(assignment));
    }

    public void deleteForLesson(Long lessonId, Long teacherId) {
        assignmentRepository.findByLessonId(lessonId).ifPresent(a -> {
            verifyTeacherOwnsLesson(a.getLesson(), teacherId);
            cleanupFiles(a);
            submissionRepository.findByAssignmentId(a.getId())
                    .forEach(sub -> deleteSubmissionFile(sub));
            assignmentRepository.delete(a);
        });
    }

    // ── Teacher: all assignments ──────────────────────────────────────────────

    public List<AssignmentResponse> getTeacherAssignments(Long teacherId) {
        return assignmentRepository.findByLessonModuleCourseTeacherId(teacherId)
                .stream().map(this::toResponse).toList();
    }

    // ── Teacher: attachment ───────────────────────────────────────────────────

    public AssignmentResponse uploadAttachment(Long lessonId, MultipartFile file, Long teacherId) {
        Assignment assignment = findTeacherAssignmentByLesson(lessonId, teacherId);
        cleanupFiles(assignment);
        String path = fileStorageService.store(file, "assignments/attachments");
        assignment.setAttachmentPath(path);
        assignment.setAttachmentName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment");
        return toResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse removeAttachment(Long lessonId, Long teacherId) {
        Assignment assignment = findTeacherAssignmentByLesson(lessonId, teacherId);
        cleanupFiles(assignment);
        assignment.setAttachmentPath(null);
        assignment.setAttachmentName(null);
        return toResponse(assignmentRepository.save(assignment));
    }

    // ── Teacher: submissions ──────────────────────────────────────────────────

    public List<AssignmentSubmissionResponse> getSubmissionsByLesson(Long lessonId, Long teacherId) {
        Assignment assignment = findTeacherAssignmentByLesson(lessonId, teacherId);
        return submissionRepository.findByAssignmentId(assignment.getId())
                .stream().map(this::toSubmissionResponse).toList();
    }

    public Resource serveSubmissionFile(Long submissionId, Long teacherId) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Dorëzimi nuk u gjet"));
        findTeacherAssignment(sub.getAssignment().getId(), teacherId);
        return fileStorageService.loadAsResource(sub.getFilePath());
    }

    public String getSubmissionFileName(Long submissionId, Long teacherId) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Dorëzimi nuk u gjet"));
        findTeacherAssignment(sub.getAssignment().getId(), teacherId);
        return sub.getFileName();
    }

    // ── Attachment download ───────────────────────────────────────────────────

    public Resource serveAttachment(Long assignmentId) {
        Assignment assignment = findAssignment(assignmentId);
        if (assignment.getAttachmentPath() == null)
            throw new RuntimeException("Nuk ka skedar të bashkangjitur");
        return fileStorageService.loadAsResource(assignment.getAttachmentPath());
    }

    public String getAttachmentName(Long assignmentId) {
        return findAssignment(assignmentId).getAttachmentName();
    }

    // ── Student: submission ───────────────────────────────────────────────────

    public AssignmentSubmissionResponse submit(Long assignmentId, MultipartFile file, Long studentId) {
        Assignment assignment = findAssignment(assignmentId);
        if (LocalDateTime.now().isAfter(assignment.getDeadline()))
            throw new RuntimeException("Afati i dorëzimit ka kaluar");
        if (submissionRepository.existsByAssignmentIdAndStudentId(assignmentId, studentId))
            throw new RuntimeException("E keni dorëzuar tashmë këtë detyrë");

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));
        String path = fileStorageService.store(file, "assignments/submissions");

        return toSubmissionResponse(submissionRepository.save(
                AssignmentSubmission.builder()
                        .assignment(assignment).student(student)
                        .filePath(path)
                        .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                        .build()
        ));
    }

    public Optional<AssignmentSubmissionResponse> getMySubmission(Long assignmentId, Long studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .map(this::toSubmissionResponse);
    }

    public List<AssignmentSubmissionResponse> getMySubmissions(Long studentId) {
        return submissionRepository.findByStudentId(studentId)
                .stream().map(this::toSubmissionResponse).toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet"));
    }

    private Assignment findTeacherAssignment(Long id, Long teacherId) {
        return assignmentRepository.findByIdAndLessonModuleCourseTeacherId(id, teacherId)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet ose nuk keni akses"));
    }

    private Assignment findTeacherAssignmentByLesson(Long lessonId, Long teacherId) {
        return assignmentRepository.findByLessonId(lessonId)
                .filter(a -> a.getLesson().getModule().getCourse().getTeacher().getId().equals(teacherId))
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet ose nuk keni akses"));
    }

    private void verifyTeacherOwnsLesson(Lesson lesson, Long teacherId) {
        if (!lesson.getModule().getCourse().getTeacher().getId().equals(teacherId))
            throw new RuntimeException("Nuk keni akses në këtë leksion");
    }

    private void cleanupFiles(Assignment a) {
        if (a.getAttachmentPath() != null)
            try { fileStorageService.delete(a.getAttachmentPath()); } catch (Exception ignored) {}
    }

    private void deleteSubmissionFile(AssignmentSubmission sub) {
        try { fileStorageService.delete(sub.getFilePath()); } catch (Exception ignored) {}
    }

    AssignmentResponse toResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle() != null ? a.getTitle() : a.getLesson().getTitulli())
                .description(a.getDescription() != null ? a.getDescription() : a.getLesson().getPermbajtja())
                .deadline(a.getDeadline())
                .hasAttachment(a.getAttachmentPath() != null)
                .attachmentName(a.getAttachmentName())
                .lessonId(a.getLesson().getId())
                .lessonTitle(a.getLesson().getTitulli())
                .createdAt(a.getCreatedAt())
                .isOpen(LocalDateTime.now().isBefore(a.getDeadline()))
                .build();
    }

    AssignmentSubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
        Assignment a = s.getAssignment();
        User student = s.getStudent();
        return AssignmentSubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(a.getId())
                .assignmentTitle(a.getTitle() != null ? a.getTitle() : a.getLesson().getTitulli())
                .deadline(a.getDeadline())
                .lessonId(a.getLesson().getId())
                .lessonTitle(a.getLesson().getTitulli())
                .studentId(student.getId())
                .studentName(student.getEmri() + " " + student.getMbiemri())
                .studentEmail(student.getEmail())
                .fileName(s.getFileName())
                .submittedAt(s.getSubmittedAt())
                .build();
    }
}
