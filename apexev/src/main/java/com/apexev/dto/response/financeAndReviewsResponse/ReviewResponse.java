package com.apexev.dto.response.financeAndReviewsResponse;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse { //Chi tiết đánh giá
    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private Integer customerId;
    private String customerFullName; // Tên người đánh giá
}
