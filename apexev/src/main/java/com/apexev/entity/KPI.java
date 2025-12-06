package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "kpis")
@Getter
@Setter
@NoArgsConstructor
public class KPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kpi_id")
    private Integer kpiId;

    @Nationalized
    @Column(nullable = false, unique = true, length = 100)
    private String name; // Tên KPI: Năng suất, Chất lượng công việc, v.v.

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết

    @Column(nullable = false)
    private Double weight = 1.0; // Trọng số (tổng các KPI = 100% hoặc 1.0)

    @Column(name = "is_active")
    private Boolean isActive = true;
}

