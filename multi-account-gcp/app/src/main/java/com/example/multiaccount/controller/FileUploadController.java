package com.example.multiaccount.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/v1/files")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);
    private static final String UPLOAD_DIR = "/tmp/uploads";
    private static final List<Map<String, Object>> uploadedFiles = new ArrayList<>();

    static {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            log.info("Upload directory created at: {}", UPLOAD_DIR);
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String filename = System.currentTimeMillis() + "_" + originalFilename;
            Path filepath = Paths.get(UPLOAD_DIR, filename);

            // Save file
            Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
            
            // Store metadata
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("name", originalFilename);
            fileInfo.put("savedName", filename);
            fileInfo.put("size", formatFileSize(file.getSize()));
            fileInfo.put("uploadDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            fileInfo.put("path", filepath.toString());
            fileInfo.put("type", file.getContentType());
            
            uploadedFiles.add(0, fileInfo); // Add to beginning of list
            
            // Keep only last 50 files
            if (uploadedFiles.size() > 50) {
                uploadedFiles.remove(uploadedFiles.size() - 1);
            }

            log.info("File uploaded successfully: {}", originalFilename);
            
            return ResponseEntity.ok(Map.of(
                "message", "File uploaded successfully",
                "filename", originalFilename,
                "size", formatFileSize(file.getSize())
            ));

        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    public List<Map<String, Object>> listFiles() {
        log.info("Listing {} uploaded files", uploadedFiles.size());
        return new ArrayList<>(uploadedFiles);
    }
    
    // Static method for other controllers to access
    public static List<Map<String, Object>> getUploadedFiles() {
        return new ArrayList<>(uploadedFiles);
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String filename) {
        try {
            Path filepath = Paths.get(UPLOAD_DIR, filename);
            Files.deleteIfExists(filepath);
            
            // Remove from metadata list
            uploadedFiles.removeIf(file -> filename.equals(file.get("savedName")));
            
            log.info("File deleted: {}", filename);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (IOException e) {
            log.error("Error deleting file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete file"));
        }
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.2f KB", size / 1024.0);
        return String.format("%.2f MB", size / (1024.0 * 1024.0));
    }
}
