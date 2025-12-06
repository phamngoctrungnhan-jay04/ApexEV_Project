// ChecklistTemplateRepository.java
package com.apexev.repository.maintenance;

import com.apexev.entity.ChecklistTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistTemplateRepository extends JpaRepository<ChecklistTemplate, Long> {
    // (Admin sẽ dùng cái này để CRUD mẫu checklist)

    // Tìm template theo service ID (để auto-match khi technician làm checklist)
    Optional<ChecklistTemplate> findByServiceId(Long serviceId);

    // Tìm tất cả template theo danh sách service IDs
    List<ChecklistTemplate> findByServiceIdIn(List<Long> serviceIds);
}