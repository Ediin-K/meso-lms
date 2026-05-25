package com.meson.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path root;

    @Override
    @PostConstruct
    public void init() {
        try {
            root = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @Override
    public String store(MultipartFile file, String subPath) {
        try {
            Path targetDir = root.resolve(subPath).normalize();
            if (!targetDir.startsWith(root)) {
                throw new RuntimeException("Invalid upload path.");
            }
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String filename = UUID.randomUUID() + "_" + sanitizeFilename(original);
            Files.copy(file.getInputStream(), targetDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            
            return subPath + "/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    @Override
    public Path load(String filename) {
        Path file = root.resolve(filename).normalize();
        if (!file.startsWith(root)) {
            throw new RuntimeException("Invalid file path.");
        }
        return file;
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Files.deleteIfExists(load(filename));
        } catch (IOException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(root.toFile());
    }

    private String sanitizeFilename(String filename) {
        String safe = Paths.get(filename).getFileName().toString();
        safe = safe.replaceAll("[\\\\/:*?\"<>|]", "_").replaceAll("\\s+", " ").trim();
        return safe.isBlank() ? "file" : safe;
    }
}
