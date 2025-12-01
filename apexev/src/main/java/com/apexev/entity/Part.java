// Part.java
package com.apexev.entity;

import com.apexev.enums.PartStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Long id;

    @Nationalized
    @Column(name = "part_name", length = 255, nullable = false)
    private String partName; //tên phụ tùng

    @Column(length = 100, unique = true)
    private String sku; // mã vạch để quản lý kho -> ví dụ: MP-VENTO-TRUOC-001

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity_in_stock")
    private int quantityInStock; //số lượng tồn kho

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price; // giá bán lẻ, chưa tính công thợ
    
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PartStatus status = PartStatus.ACTIVE; // Trạng thái phụ tùng
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}