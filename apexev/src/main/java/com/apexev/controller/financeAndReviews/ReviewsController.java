package com.apexev.controller.financeAndReviews;

import com.apexev.dto.request.financeAndReviewsRequest.CreateReviewRequest;
import com.apexev.dto.response.financeAndReviewsResponse.ReviewResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewsController {

    private final ReviewService reviewService;

    /**
     * API TẠO ĐÁNH GIÁ MỚI CHO MỘT ĐƠN HÀNG
     */
    @PostMapping("/createReview-forOrder/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User loggedInUser
    ) {
        ReviewResponse newReview = reviewService.createReview(orderId, request, loggedInUser);
        return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    }

    /**
     * API LẤY ĐÁNH GIÁ CỦA MỘT ĐƠN HÀNG
     */
    @GetMapping("/getReviews-byOrder/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> getReviewForOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        ReviewResponse review = reviewService.getReviewForOrder(orderId, loggedInUser);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }
}