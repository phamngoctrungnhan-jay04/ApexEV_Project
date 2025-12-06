package com.apexev.dto.response.supportAndSystemResponse;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedOrderId; // ID đơn hàng liên quan (nếu có)
}
