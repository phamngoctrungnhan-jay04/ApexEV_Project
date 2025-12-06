package com.apexev.repository.hr;

import com.apexev.entity.PerformanceReview;
import com.apexev.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Integer> {
    
    List<PerformanceReview> findByStaff_UserId(Integer staffId);
    
    List<PerformanceReview> findByStatus(ReviewStatus status);
    
    List<PerformanceReview> findByReviewer_UserId(Integer reviewerId);
}

