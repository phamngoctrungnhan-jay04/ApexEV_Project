// InvoiceRepository.java
package com.apexev.repository.financeAndReviews;

import com.apexev.entity.Invoice;
import com.apexev.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByServiceOrderId(Long orderId);
    List<Invoice> findByStatus(InvoiceStatus status); // VD: Tìm các hóa đơn chưa trả
}