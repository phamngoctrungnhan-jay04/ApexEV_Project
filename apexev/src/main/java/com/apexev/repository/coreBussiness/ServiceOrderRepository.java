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

    // Dùng cho KTV - Chỉ lấy các đơn đang làm việc (không bao gồm đã hoàn tất)
    List<ServiceOrder> findByTechnicianUserIdAndStatusNot(Integer technicianId, OrderStatus status);

    // Dùng cho KTV - Lấy các đơn đang làm việc (loại trừ CANCELLED, COMPLETED,
    // READY_FOR_INVOICE)
    List<ServiceOrder> findByTechnicianUserIdAndStatusNotIn(Integer technicianId, List<OrderStatus> excludedStatuses);

    // Dùng cho KTV - Lấy lịch sử công việc đã hoàn thành (CANCELLED, COMPLETED,
    // READY_FOR_INVOICE)
    List<ServiceOrder> findByTechnicianUserIdAndStatusIn(Integer technicianId, List<OrderStatus> completedStatuses);

    // Dùng cho Cố vấn
    List<ServiceOrder> findByServiceAdvisorUserIdOrderByCreatedAtDesc(Long advisorId);

    // Dùng cho Quản lý
    List<ServiceOrder> findByStatus(OrderStatus status);

    // Tìm đơn hàng theo nhiều status
    List<ServiceOrder> findByStatusIn(List<OrderStatus> statuses);

    // Tìm lịch sử của tôi
    List<ServiceOrder> findByCustomerUserIdAndStatusOrderByCompletedAtDesc(Integer customerId, OrderStatus status);

    // Xem chi tiết đơn hàng
    Optional<ServiceOrder> findByIdAndCustomerUserId(Long orderId, Integer customerId);

    // Xóa tất cả đơn hàng của 1 khách hàng
    void deleteByCustomerUserId(Integer customerId);

    // Tìm ServiceOrder theo Appointment ID (để lấy technician đã assign)
    Optional<ServiceOrder> findByAppointmentId(Long appointmentId);
}