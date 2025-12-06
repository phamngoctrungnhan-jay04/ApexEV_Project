package com.apexev.repository.coreBussiness;

import com.apexev.entity.Appointment;
import com.apexev.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Dùng cho Khách hàng
    List<Appointment> findByCustomerUserIdOrderByAppointmentTimeDesc(Integer customerId);

    // Dùng cho Cố vấn
    List<Appointment> findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(Integer advisorId);

    // Dùng cho Quản lý (xem lịch)
    List<Appointment> findByStatusOrderByAppointmentTimeAsc(AppointmentStatus status);

    List<Appointment> findByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end);

    // ktra xe đó đã có cuộc hẹn nào chưa -> đang pending hoặc đang confirm
    boolean existsByVehicleIdAndStatusIn(Long vehicleId, List<AppointmentStatus> statuses);

    // Xóa tất cả lịch hẹn của 1 khách hàng
    void deleteByCustomerUserId(Integer customerId);

    // Fetch appointment với customer và vehicle (JOIN FETCH để tránh
    // LazyInitializationException)
    @Query("SELECT a FROM Appointment a " +
            "LEFT JOIN FETCH a.customer " +
            "LEFT JOIN FETCH a.vehicle " +
            "WHERE a.id = :appointmentId")
    Optional<Appointment> findByIdWithCustomerAndVehicle(@Param("appointmentId") Long appointmentId);
}
