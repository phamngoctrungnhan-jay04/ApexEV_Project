// ServiceChecklistRepository.java
package com.apexev.repository.maintenance;

import com.apexev.entity.ServiceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceChecklistRepository extends JpaRepository<ServiceChecklist, Long> {
    Optional<ServiceChecklist> findByServiceOrderOrderId(Long orderId);
}