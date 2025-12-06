package com.apexev.repository.hr;

import com.apexev.entity.ReviewKPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewKPIRepository extends JpaRepository<ReviewKPI, Integer> {
    
    List<ReviewKPI> findByReview_ReviewId(Integer reviewId);
}

