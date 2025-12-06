package com.apexev.scheduler;

import com.apexev.entity.Appointment;
import com.apexev.enums.AppointmentStatus;
import com.apexev.repository.coreBussiness.AppointmentRepository;
import com.apexev.service.serviceImpl.SNSEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final SNSEmailService snsEmailService;

    /**
     * Gửi email nhắc nhở 24 giờ trước cuộc hẹn
     * Chạy mỗi giờ vào phút thứ 0
     */
    @Scheduled(cron = "0 0 * * * *") // Chạy mỗi giờ
    public void sendAppointmentReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reminderTime = now.plusHours(24);

            // Tìm các cuộc hẹn sắp tới trong 24 giờ tới và chưa gửi nhắc nhở
            List<Appointment> upcomingAppointments = appointmentRepository
                    .findByStatusAndAppointmentTimeBetween(
                            AppointmentStatus.CONFIRMED,
                            now,
                            reminderTime
                    );

            log.info("Found {} appointments to send reminders", upcomingAppointments.size());

            for (Appointment appointment : upcomingAppointments) {
                try {
                    String appointmentDate = appointment.getAppointmentTime()
                            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    String appointmentTime = appointment.getAppointmentTime()
                            .format(DateTimeFormatter.ofPattern("HH:mm"));
                    String vehicleInfo = appointment.getVehicle().getYearManufactured() + " " +
                            appointment.getVehicle().getBrand() + " " +
                            appointment.getVehicle().getModel();

                    snsEmailService.sendAppointmentReminderEmail(
                            appointment.getCustomer().getEmail(),
                            appointment.getCustomer().getFullName(),
                            appointmentDate,
                            appointmentTime,
                            vehicleInfo
                    );

                    log.info("Reminder email sent for appointment ID: {}", appointment.getId());
                } catch (Exception e) {
                    log.error("Error sending reminder email for appointment ID: {}", appointment.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error in appointment reminder scheduler", e);
        }
    }
}
