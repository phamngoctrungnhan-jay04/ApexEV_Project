// ReviewRepository.java
package com.apexev.repository.financeAndReviews;

import com.apexev.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByServiceOrderId(Long orderId);
    List<Review> findByServiceOrderTechnicianUserId(Long technicianId); // Xem review của 1 KTV
}