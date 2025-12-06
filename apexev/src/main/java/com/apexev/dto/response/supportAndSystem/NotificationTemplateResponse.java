package com.apexev.dto.response.supportAndSystem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateResponse {
    private Long id;
    private String templateKey;
    private String subject;
    private String body;
    private LocalDateTime createdAt;
}
