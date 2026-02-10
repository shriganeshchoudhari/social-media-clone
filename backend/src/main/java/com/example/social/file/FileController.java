package com.example.social.file;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        return fileStorageService.storeFile(file);
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName,
            jakarta.servlet.http.HttpServletRequest request) {
        // This logic is likely already handled by static resource handler or another
        // controller?
        // If fileStorageService stores to local disk and serves via ResourceHandler, we
        // might not need this.
        // But for now, returning the URL string is enough for the upload endpoint.
        return ResponseEntity.notFound().build(); // Placeholder if needed
    }
}
