package com.apexev.service.service_Interface;

import com.apexev.dto.request.coreBussinessRequest.CreatePerformanceReviewRequest;
import com.apexev.dto.response.coreBussinessResponse.PerformanceReviewResponse;

import java.util.List;

public interface PerformanceService {
    PerformanceReviewResponse createReview(CreatePerformanceReviewRequest request, Integer reviewerId);

    PerformanceReviewResponse finalizeReview(Integer reviewId);

    List<PerformanceReviewResponse> getAllReviews();

    List<PerformanceReviewResponse> getReviewsByStaff(Integer staffId);

    PerformanceReviewResponse getReviewById(Integer reviewId);
}
