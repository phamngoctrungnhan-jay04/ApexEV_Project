package com.apexev.service.serviceImpl;

import com.apexev.dto.request.financeAndReviewsRequest.CreateReviewRequest;
import com.apexev.dto.response.financeAndReviewsResponse.ReviewResponse;
import com.apexev.entity.Review;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.enums.OrderStatus;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.financeAndReviews.ReviewRepository;
import com.apexev.service.service_Interface.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final ModelMapper modelMapper;

    @Override
    public ReviewResponse createReview(Long orderId, CreateReviewRequest request, User loggedInUser) {

        // 1. Tìm đơn hàng (ServiceOrder)
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn bảo dưỡng với ID: " + orderId));

        // 2. Logic Bảo mật: Anh có phải chủ đơn hàng không?
        if (!order.getCustomer().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền đánh giá đơn hàng này.");
        }

        // 3. Logic Nghiệp vụ 1: Đơn hàng đã COMPLETED chưa?
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Bạn chỉ có thể đánh giá các đơn hàng đã hoàn thành (COMPLETED).");
        }

        // 4. Logic Nghiệp vụ 2: Đơn hàng này đã được đánh giá CHƯA?
        // (Chúng ta dùng hàm findByServiceOrderOrderId mà bạn đã tạo)
        List<Review> existingReviews = reviewRepository.findByServiceOrderId(orderId);
        if (!existingReviews.isEmpty()) {
            throw new IllegalStateException("Bạn đã đánh giá đơn hàng này rồi."); // mỗi đơn hàng chỉ được phép đánh giá 1 lần
        }

        // 5. Nếu mọi thứ OK -> Tạo Review mới
        Review newReview = new Review();
        newReview.setRating(request.getRating());
        newReview.setComment(request.getComment());
        newReview.setCustomer(loggedInUser);  // Gán khách hàng
        newReview.setServiceOrder(order);     // Gán với đơn hàng

        // 6. Lưu vào DB
        Review savedReview = reviewRepository.save(newReview);

        // 7. Map và trả về
        return convertToDto(savedReview);
    }

    @Override
    public ReviewResponse getReviewForOrder(Long orderId, User loggedInUser) {
        // (Tương tự, kiểm tra xem đơn hàng có tồn tại và có phải của user không)
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn bảo dưỡng với ID: " + orderId));

        if (!order.getCustomer().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền xem đánh giá của đơn hàng này.");
        }

        // Tìm đánh giá
        List<Review> reviews = reviewRepository.findByServiceOrderId(orderId);
        if (reviews.isEmpty()) {
            // (Nếu chưa có, trả về null hoặc ném lỗi tùy bạn)
            return null;
            // Hoặc: throw new EntityNotFoundException("Đơn hàng này chưa có đánh giá.");
        }

        // Giả sử mỗi đơn hàng chỉ có 1 đánh giá
        return convertToDto(reviews.get(0));
    }


    // hàm helper
    private ReviewResponse convertToDto(Review review) {
        ReviewResponse dto = modelMapper.map(review, ReviewResponse.class);
        // (ModelMapper sẽ tự map 'rating', 'comment', 'createdAt')

        // Map các trường lồng nhau thủ công
        dto.setCustomerId(review.getCustomer().getUserId());
        dto.setCustomerFullName(review.getCustomer().getFullName());

        return dto;
    }
}