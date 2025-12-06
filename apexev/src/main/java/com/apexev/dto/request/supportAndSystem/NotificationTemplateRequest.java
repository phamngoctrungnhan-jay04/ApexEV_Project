package com.apexev.dto.request.supportAndSystem;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateRequest {
    @NotBlank(message = "Template key không được để trống")
    private String templateKey;

    @NotBlank(message = "Subject không được để trống")
    private String subject;

    @NotBlank(message = "Body không được để trống")
    private String body;
}
