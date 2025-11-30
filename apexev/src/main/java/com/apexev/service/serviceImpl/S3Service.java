package com.apexev.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Upload file lên S3 và trả về S3 key
     * @param file MultipartFile từ request
     * @param folder Folder trong S3 (e.g., "checklist", "invoice")
     * @return S3 key (e.g., "checklist/2024-11-25_abc123.jpg")
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Validate file
            validateFile(file);

            // Generate unique file key
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String fileKey = String.format(
                    "%s/%s_%s%s",
                    folder,
                    LocalDate.now(),
                    UUID.randomUUID().toString().substring(0, 8),
                    extension
            );

            // Build PutObjectRequest
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            // Upload to S3
            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to S3: bucket={}, key={}", bucketName, fileKey);

            return fileKey;

        } catch (IOException e) {
            log.error("Error uploading file to S3", e);
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage());
        }
    }

    /**
     * Generate pre-signed URL để download file
     * @param fileKey S3 key (e.g., "checklist/2024-11-25_abc123.jpg")
     * @param expirationMinutes Thời gian hết hạn (phút)
     * @return Pre-signed URL
     */
    public String generatePresignedUrl(String fileKey, int expirationMinutes) {
        try {
            // Build GetObjectRequest
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            // Build presign request
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(expirationMinutes))
                    .getObjectRequest(getObjectRequest)
                    .build();

            // Generate presigned URL
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            String url = presignedRequest.url().toString();

            log.info("Generated pre-signed URL for key: {}, expires in {} minutes", fileKey, expirationMinutes);

            return url;

        } catch (Exception e) {
            log.error("Error generating pre-signed URL for key: {}", fileKey, e);
            throw new RuntimeException("Lỗi khi tạo URL: " + e.getMessage());
        }
    }

    /**
     * Xóa file từ S3
     * @param fileKey S3 key
     */
    public void deleteFile(String fileKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            log.info("File deleted from S3: bucket={}, key={}", bucketName, fileKey);
        } catch (Exception e) {
            log.error("Error deleting file from S3: {}", fileKey, e);
            throw new RuntimeException("Lỗi khi xóa file: " + e.getMessage());
        }
    }

    /**
     * Validate file type và size
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được rỗng");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new IllegalArgumentException(
                    "Chỉ chấp nhận ảnh (jpg, png, webp) hoặc video (mp4)"
            );
        }

        // Validate file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File không được vượt quá 10MB");
        }
    }

    /**
     * Kiểm tra file type hợp lệ
     */
    private boolean isValidFileType(String contentType) {
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                        contentType.equals("image/jpg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/webp") ||
                        contentType.equals("video/mp4")
        );
    }

    /**
     * Lấy file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * Lấy media type từ content type
     */
    public String getMediaType(String contentType) {
        if (contentType == null) {
            return "UNKNOWN";
        }
        if (contentType.startsWith("image/")) {
            return "IMAGE";
        } else if (contentType.startsWith("video/")) {
            return "VIDEO";
        }
        return "UNKNOWN";
    }
}
