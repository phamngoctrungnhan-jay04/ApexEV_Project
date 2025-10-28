// ServiceChecklist.java (Checklist THỰC TẾ của 1 đơn hàng)
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "service_checklists")
@Getter
@Setter
@NoArgsConstructor
public class ServiceChecklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_id")
    private Long id;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private ServiceOrder serviceOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ChecklistTemplate template; // Mẫu đã dùng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician; // KTV thực hiện

    // Một checklist thực tế có nhiều kết quả
    @OneToMany(mappedBy = "serviceChecklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceChecklistResult> results;
}