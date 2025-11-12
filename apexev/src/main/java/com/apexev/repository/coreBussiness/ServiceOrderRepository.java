// ServiceOrderRepository.java
package com.apexev.repository.coreBussiness;

import com.apexev.entity.ServiceOrder;
import com.apexev.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    // Dùng cho Khách hàng
    List<ServiceOrder> findByCustomerUserIdOrderByCreatedAtDesc(Long customerId);

    // Dùng cho KTV
    List<ServiceOrder> findByTechnicianUserIdAndStatusNot(Long technicianId, OrderStatus status);

    // Dùng cho Cố vấn
    List<ServiceOrder> findByServiceAdvisorUserIdOrderByCreatedAtDesc(Long advisorId);

    // Dùng cho Quản lý
    List<ServiceOrder> findByStatus(OrderStatus status);

    // Tìm lịch sử của tôi
    List<ServiceOrder> findByCustomerUserIdAndStatusOrderByCompletedAtDesc(Integer customerId, OrderStatus status);

    //Xem chi tiết đơn hàng
    Optional<ServiceOrder> findByIdAndCustomerUserId(Long orderId, Integer customerId);
}