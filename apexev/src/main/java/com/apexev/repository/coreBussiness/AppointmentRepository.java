package com.apexev.repository.coreBussiness;

import com.apexev.entity.Appointment;
import com.apexev.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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
}
