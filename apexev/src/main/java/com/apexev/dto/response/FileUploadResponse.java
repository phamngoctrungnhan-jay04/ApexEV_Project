package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String s3Key;           // S3 key để lưu vào DB
    private String mediaType;       // IMAGE or VIDEO
    private String fileName;        // Tên file gốc
    private String message;         // Thông báo
}
