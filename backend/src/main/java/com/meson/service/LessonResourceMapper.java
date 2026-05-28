package com.meson.service;

import com.meson.dto.LessonResourceResponse;
import com.meson.entity.LessonResource;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class LessonResourceMapper {

    public LessonResourceResponse toResponse(LessonResource resource) {
        if (resource == null) {
            return null;
        }
        String type = classify(resource.getEmriOrigjinal(), resource.getTipi());
        boolean previewable = isPreviewable(type, resource.getTipi());
        String base = "/api/resources/" + resource.getId();

        return LessonResourceResponse.builder()
                .id(resource.getId())
                .emriOrigjinal(resource.getEmriOrigjinal())
                .tipi(resource.getTipi())
                .madhesia(resource.getMadhesia())
                .resourceType(type)
                .previewable(previewable)
                .url(base + "/download")
                .viewUrl(base + "/view")
                .downloadUrl(base + "/download")
                .createdAt(resource.getCreatedAt())
                .build();
    }

    private String classify(String filename, String mimeType) {
        String lowerName = filename != null ? filename.toLowerCase(Locale.ROOT) : "";
        String lowerMime = mimeType != null ? mimeType.toLowerCase(Locale.ROOT) : "";
        if (lowerMime.startsWith("video/") || lowerName.matches(".*\\.(mp4|webm|mov|mkv)$")) {
            return "VIDEO";
        }
        if ("application/pdf".equals(lowerMime) || lowerName.endsWith(".pdf")) {
            return "PDF";
        }
        if (lowerMime.startsWith("image/") || lowerName.matches(".*\\.(jpg|jpeg|png|gif|webp|svg)$")) {
            return "IMAGE";
        }
        if (lowerName.matches(".*\\.(doc|docx)$")) {
            return "DOCUMENT";
        }
        if (lowerName.matches(".*\\.(ppt|pptx)$")) {
            return "PRESENTATION";
        }
        if (lowerName.matches(".*\\.(xls|xlsx|csv)$")) {
            return "SPREADSHEET";
        }
        if (lowerName.matches(".*\\.(zip|rar|7z)$")) {
            return "ARCHIVE";
        }
        return "FILE";
    }

    private boolean isPreviewable(String type, String mimeType) {
        String lowerMime = mimeType != null ? mimeType.toLowerCase(Locale.ROOT) : "";
        return "PDF".equals(type)
                || "IMAGE".equals(type)
                || "VIDEO".equals(type)
                || lowerMime.startsWith("text/");
    }
}
