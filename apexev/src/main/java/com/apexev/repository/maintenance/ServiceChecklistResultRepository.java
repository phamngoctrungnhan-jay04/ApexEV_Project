package com.apexev.repository.maintenance;

import com.apexev.entity.ServiceChecklistResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceChecklistResultRepository extends JpaRepository<ServiceChecklistResult, Long> {
    
    // Tìm tất cả kết quả của một checklist
    List<ServiceChecklistResult> findByServiceChecklistId(Long checklistId);
    
    // Tìm kết quả theo checklist và template item
    ServiceChecklistResult findByServiceChecklistIdAndTemplateItemId(Long checklistId, Long templateItemId);
}
