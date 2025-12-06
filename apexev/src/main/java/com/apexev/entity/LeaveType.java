package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
@NoArgsConstructor
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_type_id")
    private Integer leaveTypeId;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // ANNUAL, SICK, UNPAID, MATERNITY, etc.

    @Nationalized
    @Column(nullable = false, length = 100)
    private String name; // Phép năm, Nghỉ ốm, v.v.

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = true; // Có hưởng lương không

    @Column(name = "accrual_rate")
    private Double accrualRate; // Số ngày tích lũy mỗi tháng (ví dụ: 1.0 ngày/tháng)

    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear; // Số ngày tối đa mỗi năm

    @Column(name = "requires_document")
    private Boolean requiresDocument = false; // Yêu cầu giấy tờ (giấy bác sĩ, v.v.)

    @Column(name = "is_active")
    private Boolean isActive = true;
}

