package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Entity
@Table(name = "services") // Ánh xạ CHÍNH XÁC tới tên bảng mới
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Column name sẽ là 'id' theo quy ước JPA

    // 1. Tên Dịch vụ (VI) - Frontend sử dụng service.name
    @Nationalized
    @Column(name = "name", length = 255, nullable = false)
    private String name;

    // 2. Tên Dịch vụ (EN) - Frontend sử dụng service.name_en
    @Column(name = "name_en", length = 255)
    private String nameEn;

    // 3. Mô tả (VI)
    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description;

    // 4. Mô tả (EN)
    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    // 5. Category (Cho việc lọc)
    @Column(name = "category", length = 50)
    private String category;

    // 6. Giá (Price) - Frontend sử dụng service.unit_price
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // 7. Thời gian dự kiến - Frontend sử dụng service.estimated_duration
    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    // 8. Trạng thái hoạt động
    @Column(name = "is_active")
    private Boolean isActive = true;
}