package com.apexev.repository;

import com.apexev.entity.Appointment;
import com.apexev.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Dùng cho Khách hàng
    List<Appointment> findByCustomerUserIdOrderByAppointmentTimeDesc(Long customerId);

    // Dùng cho Cố vấn
    List<Appointment> findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(Long advisorId);

    // Dùng cho Quản lý (xem lịch)
    List<Appointment> findByStatusOrderByAppointmentTimeAsc(AppointmentStatus status);
    List<Appointment> findByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end);
}
