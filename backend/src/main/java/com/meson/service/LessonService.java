package com.meson.service;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.entity.Lesson;
import com.meson.entity.Module;
import com.meson.repository.LessonRepository;
import com.meson.repository.LessonResourceRepository;
import com.meson.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonResourceMapper lessonResourceMapper;

    public List<LessonResponse> getByModuleId(Long moduleId) {
        return lessonRepository.findByModuleIdOrderByRradhitjaAsc(moduleId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public LessonResponse getById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        return toResponse(lesson);
    }

    public LessonResponse create(LessonRequest request) {
        if (lessonRepository.existsByTitulliAndModuleId(request.getTitulli(), request.getModuleId())) {
            throw new RuntimeException("Leksioni tashmë ekziston në këtë modul");
        }

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Moduli nuk u gjet"));

        Lesson lesson = new Lesson();
        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());
        lesson.setModule(module);

        return toResponse(lessonRepository.save(lesson));
    }

    public LessonResponse update(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Moduli nuk u gjet"));

        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());
        lesson.setModule(module);

        return toResponse(lessonRepository.save(lesson));
    }

    public void delete(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new RuntimeException("Leksioni nuk u gjet");
        }
        lessonRepository.deleteById(id);
    }

    private LessonResponse toResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .titulli(lesson.getTitulli())
                .permbajtja(lesson.getPermbajtja())
                .lloji(lesson.getLloji())
                .videoUrl(lesson.getVideoUrl())
                .resourceUrl(lesson.getResourceUrl())
                .rradhitja(lesson.getRradhitja())
                .moduleId(lesson.getModule().getId())
                .moduleTitulli(lesson.getModule().getTitulli())
                .createdAt(lesson.getCreatedAt())
                .resources(lessonResourceRepository.findByLessonId(lesson.getId()).stream()
                        .map(lessonResourceMapper::toResponse)
                        .toList())
                .build();
    }
}
