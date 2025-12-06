package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long id;

    @Nationalized
    @Column(name = "service_name", length = 255, nullable = false)
    private String serviceName; //tên gói dịch vụ

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description; // mô tả dịch vụ

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice; //giá niêm yết, kiểu tiền công của thợ
}