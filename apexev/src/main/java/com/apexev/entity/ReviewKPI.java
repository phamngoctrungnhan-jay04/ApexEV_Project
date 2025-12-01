package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "review_kpis",
       uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "kpi_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ReviewKPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_kpi_id")
    private Integer reviewKpiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private PerformanceReview review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kpi_id", nullable = false)
    private KPI kpi;

    @Column(nullable = false)
    private Double score; // Điểm (1-5)

    @Column(columnDefinition = "TEXT")
    private String comment; // Nhận xét cho KPI này
}

