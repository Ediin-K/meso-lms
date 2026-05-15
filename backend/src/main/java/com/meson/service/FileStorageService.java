package com.meson.service;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface FileStorageService {
    void init();
    String store(MultipartFile file, String subPath);
    Path load(String filename);
    org.springframework.core.io.Resource loadAsResource(String filename);
    void delete(String filename);
    void deleteAll();
}
