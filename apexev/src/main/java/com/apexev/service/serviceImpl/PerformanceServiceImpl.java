package com.apexev.service.serviceImpl;

import com.apexev.dto.request.CreatePerformanceReviewRequest;
import com.apexev.dto.response.PerformanceReviewResponse;
import com.apexev.entity.KPI;
import com.apexev.entity.PerformanceReview;
import com.apexev.entity.ReviewKPI;
import com.apexev.entity.User;
import com.apexev.enums.ReviewStatus;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.hr.KPIRepository;
import com.apexev.repository.hr.PerformanceReviewRepository;
import com.apexev.repository.hr.ReviewKPIRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final ReviewKPIRepository reviewKPIRepository;
    private final KPIRepository kpiRepository;
    private final UserRepository userRepository;

    @Transactional
    public PerformanceReviewResponse createReview(CreatePerformanceReviewRequest request, Integer reviewerId) {
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người đánh giá"));

        PerformanceReview review = new PerformanceReview();
        review.setStaff(staff);
        review.setReviewer(reviewer);
        review.setPeriodStart(request.getPeriodStart());
        review.setPeriodEnd(request.getPeriodEnd());
        review.setOverallRating(request.getOverallRating());
        review.setStrengths(request.getStrengths());
        review.setWeaknesses(request.getWeaknesses());
        review.setRecommendations(request.getRecommendations());
        review.setFeedback(request.getFeedback());
        review.setStatus(ReviewStatus.DRAFT);

        PerformanceReview saved = reviewRepository.save(review);

        // Add KPIs
        if (request.getKpis() != null) {
            for (CreatePerformanceReviewRequest.ReviewKPIRequest kpiReq : request.getKpis()) {
                KPI kpi = kpiRepository.findById(kpiReq.getKpiId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy KPI"));

                ReviewKPI reviewKPI = new ReviewKPI();
                reviewKPI.setReview(saved);
                reviewKPI.setKpi(kpi);
                reviewKPI.setScore(kpiReq.getScore());
                reviewKPI.setComment(kpiReq.getComment());

                reviewKPIRepository.save(reviewKPI);
            }
        }

        return mapToResponse(reviewRepository.findById(saved.getReviewId()).orElseThrow());
    }

    @Transactional
    public PerformanceReviewResponse finalizeReview(Integer reviewId) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));

        review.setStatus(ReviewStatus.FINALIZED);
        review.setFinalizedAt(LocalDateTime.now());

        PerformanceReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    public List<PerformanceReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PerformanceReviewResponse> getReviewsByStaff(Integer staffId) {
        return reviewRepository.findByStaff_UserId(staffId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PerformanceReviewResponse getReviewById(Integer reviewId) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        return mapToResponse(review);
    }

    private PerformanceReviewResponse mapToResponse(PerformanceReview review) {
        PerformanceReviewResponse response = new PerformanceReviewResponse();
        response.setReviewId(review.getReviewId());
        response.setStaffId(review.getStaff().getUserId());
        response.setStaffName(review.getStaff().getFullName());
        response.setReviewerName(review.getReviewer().getFullName());
        response.setPeriodStart(review.getPeriodStart());
        response.setPeriodEnd(review.getPeriodEnd());
        response.setStatus(review.getStatus());
        response.setOverallRating(review.getOverallRating());
        response.setStrengths(review.getStrengths());
        response.setWeaknesses(review.getWeaknesses());
        response.setRecommendations(review.getRecommendations());
        response.setFeedback(review.getFeedback());
        response.setFinalizedAt(review.getFinalizedAt());

        if (review.getReviewKPIs() != null) {
            List<PerformanceReviewResponse.KPIScoreResponse> kpiScores = review.getReviewKPIs().stream()
                    .map(rk -> {
                        PerformanceReviewResponse.KPIScoreResponse kpi = new PerformanceReviewResponse.KPIScoreResponse();
                        kpi.setKpiId(rk.getKpi().getKpiId());
                        kpi.setKpiName(rk.getKpi().getName());
                        kpi.setScore(rk.getScore());
                        kpi.setComment(rk.getComment());
                        return kpi;
                    })
                    .collect(Collectors.toList());
            response.setKpiScores(kpiScores);
        }

        return response;
    }
}

