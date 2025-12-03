// ServiceChecklistItem.java - Hạng mục kiểm tra (step) của mỗi dịch vụ
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "service_checklist_items")
@Getter
@Setter
@NoArgsConstructor
public class ServiceChecklistItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    // Tên bước kiểm tra (VI)
    @Nationalized
    @Column(name = "item_name", length = 255, nullable = false)
    private String itemName;

    // Tên bước kiểm tra (EN)
    @Column(name = "item_name_en", length = 255)
    private String itemNameEn;

    // Mô tả chi tiết bước kiểm tra (VI)
    @Nationalized
    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    // Mô tả chi tiết bước kiểm tra (EN)
    @Column(name = "item_description_en", columnDefinition = "TEXT")
    private String itemDescriptionEn;

    // Thứ tự bước (step order)
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    // Danh mục của bước kiểm tra (battery, motor, brake, software, cooling, etc.)
    @Column(name = "category", length = 50)
    private String category;

    // Thời gian ước tính (phút)
    @Column(name = "estimated_time")
    private Integer estimatedTime;

    // Bắt buộc hay không
    @Column(name = "is_required")
    private Boolean isRequired = true;

    // Trạng thái hoạt động
    @Column(name = "is_active")
    private Boolean isActive = true;

    // --- Relationships ---
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private MaintenanceService service;
}
