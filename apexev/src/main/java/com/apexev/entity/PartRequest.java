package com.apexev.entity;

import com.apexev.enums.PartRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu yêu cầu phụ tùng của Technician
 */
@Entity
@Table(name = "part_requests")
@Getter
@Setter
@NoArgsConstructor
public class PartRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long id;

    // Technician yêu cầu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    // Service Order liên quan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private ServiceOrder serviceOrder;

    // Phụ tùng được yêu cầu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    // Số lượng yêu cầu
    @Column(name = "quantity_requested", nullable = false)
    private int quantityRequested;

    // Mức độ khẩn cấp
    @Nationalized
    @Column(length = 20)
    private String urgency = "NORMAL"; // URGENT, NORMAL, LOW

    // Ghi chú của technician
    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String technicianNotes;

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PartRequestStatus status = PartRequestStatus.PENDING;

    // Người duyệt (Advisor/Admin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    // Ghi chú của người duyệt
    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String approverNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
