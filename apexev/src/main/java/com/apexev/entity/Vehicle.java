package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long id;

    @Column(name = "license_plate", length = 20, nullable = false, unique = true)
    private String licensePlate; //biển số xe

    @Column(name = "vin_number", length = 17, unique = true)
    private String vinNumber; // số khung dùng để tìm phụ tùng chính xác

    @Column(length = 100)
    private String model;

    @Column(length = 100)
    private String brand;

    @Column(name = "year_manufactured")
    private Integer yearManufactured; //năm sản xuất

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer; // Liên kết về User, khóa ngoại, kiểu xe này của ô A

    @OneToMany(mappedBy = "vehicle")
    private Set<ServiceOrder> serviceOrders;
}