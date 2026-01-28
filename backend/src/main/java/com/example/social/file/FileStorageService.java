package com.example.social.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(com.example.social.config.AppProperties appProperties) {
        this.fileStorageLocation = Paths.get(appProperties.getUploadDir()).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new RuntimeException("Invalid file name");
        }

        // Generate unique filename
        String ext = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            ext = originalFileName.substring(i);
        }
        String fileName = UUID.randomUUID().toString() + ext;

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public void deleteFile(String url) {
        try {
            // Extract filename from URL (e.g., "/uploads/abc.jpg" -> "abc.jpg")
            String fileName = url.replace("/uploads/", "");
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            // Delete the file if it exists
            java.nio.file.Files.deleteIfExists(filePath);
        } catch (Exception ex) {
            // Log the error but don't throw - we don't want delete operations to fail if
            // file doesn't exist
            System.err.println("Could not delete file from URL: " + url + ". Error: " + ex.getMessage());
        }
    }
}
