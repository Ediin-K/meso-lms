package com.meson.service;

import com.meson.dto.RoleRequest;
import com.meson.dto.RoleResponse;
import com.meson.entity.Role;
import com.meson.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService{
    private final RoleRepository roleRepository;

    public List<RoleResponse> getAll(){
        return roleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public RoleResponse getById(Long id){
        Role role = roleRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Roli nuk u gjet"));
        return toResponse(role);

    }

    public RoleResponse create(RoleRequest request) {
        Role role = new Role();
        role.setEmertimi(request.getEmertimi());
        role.setNormalizedName(request.getNormalizedName().toUpperCase());
        role.setPershkrimi(request.getPershkrimi());
        return toResponse(roleRepository.save(role));
    }
    public RoleResponse update(Long id,RoleRequest request){
        Role role = roleRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Roli nuk u gjet"));
        role.setEmertimi(request.getEmertimi());
        role.setNormalizedName(request.getNormalizedName().toUpperCase());
        role.setPershkrimi(request.getPershkrimi());
        return toResponse(roleRepository.save(role));
    }

    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Roli nuk u gjet"));
        if (!role.getUserRoles().isEmpty()) {
            throw new RuntimeException("Nuk mund të fshish rolin — ka userë me këtë rol");
        }
        roleRepository.deleteById(id);
    }
    private RoleResponse toResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setEmertimi(role.getEmertimi());
        response.setNormalizedName(role.getNormalizedName());
        response.setPershkrimi(role.getPershkrimi());
        return response;
    }

}
