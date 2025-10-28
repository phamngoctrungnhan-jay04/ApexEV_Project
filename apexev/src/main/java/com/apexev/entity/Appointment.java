// Appointment.java
package com.apexev.entity;

import com.apexev.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long id;

    @Nationalized
    @Column(name = "requested_service", columnDefinition = "TEXT")
    private String requestedService; // Dịch vụ khách yêu cầu ban đầu

    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime; //thời gian hẹn

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String notes; // Ghi chú của khách khi đặt lịch, ví dụ "đi cùng vợ or something"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer; // Liên kết về id user đặt lịch

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_advisor_id") // Cố vấn phụ trách (có thể null)
    private User serviceAdvisor; // Liên kết về User

    @OneToOne(mappedBy = "appointment")
    private ServiceOrder serviceOrder;
}