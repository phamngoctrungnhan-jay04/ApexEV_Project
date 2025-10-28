package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "staff_profiles")
@Getter
@Setter
@NoArgsConstructor
public class StaffProfile {

    @Id
    @Column(name = "staff_id") // Dùng chung Primary Key với User
    private Integer id;

    @Column(name = "employee_code", length = 50, unique = true)
    private String employeeCode; // ví dụ APEX-KTV-007 chẳng hạn

    @Column(name = "hire_date")
    private LocalDate hireDate; //ngày vào làm


    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "staff_id")
    private User user;
}