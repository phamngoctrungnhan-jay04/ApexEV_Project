package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.dto.response.financeAndReviewsResponse.ReviewResponse;
import com.apexev.enums.OrderStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ServiceOrderDetailResponse { //xem chi tiết đơn hàng
    private Long id;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // Thông tin khách và xe
    private String customerFullName;
    private String customerPhone;
    private String vehicleLicensePlate;
    private String vehicleBrand;
    private String vehicleModel;

    // Thông tin nhân viên
    private String serviceAdvisorName;
    private String technicianName;

    // Ghi chú
    private String customerDescription;
    private String advisorNotes;
    private String technicianNotes;

    private List<ServiceOrderItemResponse> items;
    private InvoiceResponse invoice;
    private ReviewResponse review; // (Có thể null nếu khách chưa đánh giá)
}
