package com.meson.service;

import com.meson.entity.Course;
import com.meson.entity.Module;
import com.meson.repository.ModuleRepository;
import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.repository.CourseRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleService{

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public List<ModuleResponse> getAll(){
        return moduleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ModuleResponse getById(Long id){
        Module module = moduleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Moduli nuk u gjet"));
        return toResponse(module);
    }

    public List<ModuleResponse> getByCourseId(Long courseId){
        return moduleRepository.findByCourseIdOrderByRradhitjaAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ModuleResponse create(ModuleRequest request){
        if(moduleRepository.existsByTitulliAndCourseId(request.getTitulli(),request.getCourseId())){
            throw new RuntimeException("Moduli tashme ekziston ne kete kurs");
        }
        Module module = new Module();
        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));
        module.setCourse(course);
        return toResponse(moduleRepository.save(module));
    }

    public ModuleResponse update(Long id,ModuleRequest request){
        Module module = moduleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException ("Moduli nuk u gjet"));
        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));
        module.setCourse(course);
        return toResponse(moduleRepository.save(module));
    }

    public void delete(Long id){
        if(!moduleRepository.existsById(id)){
            throw new RuntimeException("Moduli nuk u gjet");
        }
        moduleRepository.deleteById(id);
    }

    private ModuleResponse toResponse(Module module){
        return ModuleResponse.builder()
                .id(module.getId())
                .titulli(module.getTitulli())
                .pershkrimi(module.getPershkrimi())
                .rradhitja(module.getRradhitja())
                .createdAt(module.getCreatedAt())
                .courseId(module.getCourse().getId())
                .courseTitulli(module.getCourse().getTitulli())
                .build();
    }
}
