package com.meson.service;

import com.meson.dto.CourseResponse;
import com.meson.dto.CourseRequest;
import com.meson.entity.Course;
import com.meson.entity.User;
import com.meson.entity.CourseCategory;
import com.meson.repository.CourseRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.CourseCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseCategoryRepository categoryRepository;

    public List<CourseResponse> getAll() {
        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));
        return toResponse(course);
    }

    public CourseResponse create(CourseRequest request) {
        if (courseRepository.existsByTitulli(request.getTitulli())) {
            throw new RuntimeException("Kursi tashme ekziston");
        }

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));

        CourseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategoria nuk u gjet"));

        Course course = new Course();
        course.setTitulli(request.getTitulli());
        course.setPershkrimi(request.getPershkrimi());
        course.setCmimi(request.getCmimi());
        course.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        course.setNiveli(request.getNiveli());
        course.setStatusi(request.getStatusi());
        course.setTeacher(teacher);
        course.setCourseCategory(category);
        course.setSemester(request.getSemester());
        course.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));

        return toResponse(courseRepository.save(course));
    }

    public CourseResponse update(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));

        CourseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategoria nuk u gjet"));

        course.setTitulli(request.getTitulli());
        course.setPershkrimi(request.getPershkrimi());
        course.setCmimi(request.getCmimi());
        course.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        course.setNiveli(request.getNiveli());
        course.setStatusi(request.getStatusi());
        course.setTeacher(teacher);
        course.setCourseCategory(category);
        course.setSemester(request.getSemester());
        course.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));

        return toResponse(courseRepository.save(course));
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Kursi nuk u gjet");
        }
        courseRepository.deleteById(id);
    }

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .titulli(course.getTitulli())
                .pershkrimi(course.getPershkrimi())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getEmri())
                .categoryId(course.getCourseCategory().getId())
                .categoryName(course.getCourseCategory().getEmertimi())
                .semester(course.getSemester())
                .enrollmentKey(course.getEnrollmentKey())
                .cmimi(course.getCmimi())
                .ects(course.getEcts())
                .niveli(course.getNiveli())
                .statusi(course.getStatusi())
                .createdAt(course.getCreatedAt())
                .build();
    }

    public List<CourseResponse> getByCategoryAndSemester(Long categoryId, Integer semester) {
        return courseRepository
                .findByCourseCategoryIdAndSemester(categoryId, semester)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getBySemester(Integer semester) {
        return courseRepository.findBySemester(semester)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalizeEnrollmentKey(String enrollmentKey) {
        if (!StringUtils.hasText(enrollmentKey)) {
            return null;
        }
        return enrollmentKey.trim();
    }

}
