// ServiceChecklistRepository.java
package com.apexev.repository.maintenance;

import com.apexev.entity.ServiceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceChecklistRepository extends JpaRepository<ServiceChecklist, Long> {
    List<ServiceChecklist> findByServiceOrderId(Long orderId);

    Optional<ServiceChecklist> findByServiceOrderIdAndTemplateId(Long orderId, Long templateId);
}