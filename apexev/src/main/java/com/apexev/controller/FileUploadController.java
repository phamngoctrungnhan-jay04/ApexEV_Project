package com.apexev.controller;

import com.apexev.dto.response.FileUploadResponse;
import com.apexev.service.serviceImpl.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final S3Service s3Service;

    /**
     * 1. API Upload dành cho Kỹ thuật viên/Admin (Checklist, Invoice...)
     * - Endpoint: POST /api/files/upload
     * - Frontend gửi: file (binary), folder (tùy chọn)
     * folder của bài sẽ gồm checklist (mặc định)
     * invoice - Dùng cho Admin/Kế toán up hóa đơn
     * avatars: Dùng cho User up ảnh đại diện
     * vehicles: Dùng cho User up ảnh xe
     */
    @PostMapping(value = "technician/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "checklist") String folder
    ) {
        log.info("Technician uploading file: filename={}, size={}, folder={}", 
                file.getOriginalFilename(), file.getSize(), folder);
        
        // Gọi hàm xử lý chung để tránh lặp code
        return uploadToS3(file, folder);
    }

    /**
     * 2. API Upload dành cho Khách hàng (Avatar, Xe)
     * - Endpoint: POST /api/files/user/upload
     * - Frontend gửi: file (binary), type ('avatar' hoặc 'vehicle')
     */
    @PostMapping(value = "/customer/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FileUploadResponse> uploadUserFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type
    ) {
        // Tự động chọn folder dựa trên loại upload để bảo mật
        String targetFolder;
        if ("avatar".equalsIgnoreCase(type)) {
            targetFolder = "avatars";
        } else if ("vehicle".equalsIgnoreCase(type)) {
            targetFolder = "vehicles";
        } else {
            throw new IllegalArgumentException("Loại upload không hợp lệ. Chỉ chấp nhận 'avatar' hoặc 'vehicle'");
        }

        log.info("User uploading file: filename={}, type={}", file.getOriginalFilename(), type);

        return uploadToS3(file, targetFolder);
    }

    /**
     * Hàm xử lý logic chung cho việc Upload và tạo Response
     */
    private ResponseEntity<FileUploadResponse> uploadToS3(MultipartFile file, String folder) {
        // 1. Upload lên S3 và nhận về Key
        String s3Key = s3Service.uploadFile(file, folder);
        
        // 2. Lấy loại file (IMAGE/VIDEO)
        String mediaType = s3Service.getMediaType(file.getContentType());

        // 3. Tạo DTO trả về
        FileUploadResponse response = FileUploadResponse.builder()
                .s3Key(s3Key)
                .mediaType(mediaType)
                .fileName(file.getOriginalFilename())
                .message("Upload thành công")
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 3. API Lấy link xem file (Presigned URL)
     * - Endpoint: GET /api/files/view
     */
    @GetMapping("/view")
    public ResponseEntity<Map<String, String>> getFileUrl(
            @RequestParam("key") String key,
            @RequestParam(value = "expiration", defaultValue = "60") int expirationMinutes
    ) {
        log.info("Get file URL request: key={}, expiration={} minutes", key, expirationMinutes);

        String url = s3Service.generatePresignedUrl(key, expirationMinutes);

        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("expiresIn", expirationMinutes + " minutes");

        return ResponseEntity.ok(response);
    }

    /**
     * 4. API Xóa file
     * - Endpoint: DELETE /api/files/delete
     */
    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("key") String key) {
        log.info("Delete file request: key={}", key);

        s3Service.deleteFile(key);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa file thành công");
        response.put("deletedKey", key);

        return ResponseEntity.ok(response);
    }
}