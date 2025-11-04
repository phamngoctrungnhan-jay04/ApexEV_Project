package com.apexev.entity;

import com.apexev.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId; // Nên dùng Long cho ID

    @Nationalized // Áp dụng cho fullName
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 100, unique = true) // Thêm 'unique = true'
    private String email;

    @Column(nullable = false, length = 20, unique = true) // Thêm 'unique = true'
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    // --- Relationships ---

    // 1-1 với Hồ sơ nhân viên (chỉ nhân viên mới có)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private StaffProfile staffProfile;

    // 1-N với Xe (với vai trò Khách hàng)
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Vehicle> vehicles;

    // 1-N với Lịch hẹn (với vai trò Khách hàng)
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private Set<Appointment> appointmentsAsCustomer;

    // 1-N với Lịch hẹn (với vai trò Cố vấn)
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<Appointment> appointmentsAsAdvisor;

    // 1-N với Đơn bảo dưỡng (với vai trò Khách hàng)
    @OneToMany(mappedBy = "customer")
    private Set<ServiceOrder> serviceOrdersAsCustomer;

    // 1-N với Đơn bảo dưỡng (với vai trò Cố vấn)
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<ServiceOrder> serviceOrdersAsAdvisor;

    // 1-N với Đơn bảo dưỡng (với vai trò Kỹ thuật viên)
    @OneToMany(mappedBy = "technician")
    private Set<ServiceOrder> serviceOrdersAsTechnician;

    // 1-N với Đánh giá (với vai trò Khách hàng)
    @OneToMany(mappedBy = "customer")
    private Set<Review> reviews;

    // 1-N với Thông báo (người nhận)
    @OneToMany(mappedBy = "user")
    private Set<Notification> notifications;

    // 1-N với Chat (với vai trò Khách hàng)
    @OneToMany(mappedBy = "customer")
    private Set<ChatConversation> chatsAsCustomer;

    // 1-N với Chat (với vai trò Cố vấn)
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<ChatConversation> chatsAsAdvisor;
}