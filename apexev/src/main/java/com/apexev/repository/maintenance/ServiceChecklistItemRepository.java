package com.apexev.repository.maintenance;

import com.apexev.entity.ServiceChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceChecklistItemRepository extends JpaRepository<ServiceChecklistItem, Long> {

    // Lấy tất cả checklist items theo service ID, sắp xếp theo thứ tự step
    List<ServiceChecklistItem> findByServiceIdAndIsActiveTrueOrderByStepOrderAsc(Long serviceId);

    // Lấy tất cả checklist items theo service ID
    List<ServiceChecklistItem> findByServiceIdOrderByStepOrderAsc(Long serviceId);

    // Lấy checklist items theo category
    List<ServiceChecklistItem> findByServiceIdAndCategoryOrderByStepOrderAsc(Long serviceId, String category);

    // Đếm số items của một service
    long countByServiceId(Long serviceId);

    // Kiểm tra xem service có checklist items không
    boolean existsByServiceId(Long serviceId);
}
