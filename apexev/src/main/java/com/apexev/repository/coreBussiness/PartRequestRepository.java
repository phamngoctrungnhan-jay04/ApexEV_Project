package com.apexev.repository.coreBussiness;

import com.apexev.entity.PartRequest;
import com.apexev.enums.PartRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {

    // Tìm theo technician
    List<PartRequest> findByTechnicianUserIdOrderByCreatedAtDesc(Integer technicianId);

    // Tìm theo service order
    List<PartRequest> findByServiceOrderIdOrderByCreatedAtDesc(Long serviceOrderId);

    // Tìm theo status
    List<PartRequest> findByStatusOrderByCreatedAtDesc(PartRequestStatus status);

    // Tìm tất cả đang chờ duyệt
    List<PartRequest> findByStatusInOrderByCreatedAtDesc(List<PartRequestStatus> statuses);
}
