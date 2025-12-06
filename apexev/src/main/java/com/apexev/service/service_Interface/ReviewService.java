package com.apexev.service.service_Interface;

import com.apexev.dto.request.financeAndReviewsRequest.CreateReviewRequest;
import com.apexev.dto.response.financeAndReviewsResponse.ReviewResponse;
import com.apexev.entity.User;

public interface ReviewService {

    /**
     * Khách hàng tạo một đánh giá mới cho một đơn bảo dưỡng đã hoàn thành.
     *
     * @param orderId ID của ServiceOrder (Đơn bảo dưỡng)
     * @param request DTO chứa (rating, comment)
     * @param loggedInUser Người dùng (Customer) đang đăng nhập
     * @return DTO của Review vừa được tạo
     */
    ReviewResponse createReview(Long orderId, CreateReviewRequest request, User loggedInUser);

    /**
     * Lấy đánh giá của một đơn hàng (nếu có).
     */
    ReviewResponse getReviewForOrder(Long orderId, User loggedInUser);
}