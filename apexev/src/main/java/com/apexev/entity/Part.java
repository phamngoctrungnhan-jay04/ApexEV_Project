// Part.java
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

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
}