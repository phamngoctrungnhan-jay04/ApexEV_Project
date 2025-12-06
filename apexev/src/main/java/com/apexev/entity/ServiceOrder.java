// ServiceOrder.java
package com.apexev.entity;

import com.apexev.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "service_orders")
@Getter
@Setter
@NoArgsConstructor
public class ServiceOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderStatus status = OrderStatus.CONFIRMED;

    @Nationalized
    @Column(name = "customer_description", columnDefinition = "TEXT")
    private String customerDescription; // Mô tả của khách khi mang xe đến, kiểu xe bị này kia..

    @Nationalized
    @Column(name = "advisor_notes", columnDefinition = "TEXT")
    private String advisorNotes; // note của cố vấn về yêu cầu của khách hàng (nếu có), kiểu như rửa xe trước khi
                                 // giao hoặc something
    @Nationalized
    @Column(name = "technician_notes", columnDefinition = "TEXT")
    private String technicianNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // --- Relationships ---

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", unique = true) // Có thể null
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer; // Liên kết về User

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_advisor_id", nullable = false)
    private User serviceAdvisor; // Liên kết về User

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false) // KTV được chỉ định khi assign
    private User technician; // Liên kết về User

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceOrderItem> orderItems;

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceChecklist> checklists;

    @OneToOne(mappedBy = "serviceOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;

    @OneToMany(mappedBy = "serviceOrder")
    private Set<Review> reviews;
}