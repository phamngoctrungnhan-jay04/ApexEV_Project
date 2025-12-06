package com.apexev.entity;

import com.apexev.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- QUAN TRỌNG: Thêm dòng này
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
    private Integer userId;

    @Nationalized
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 100, unique = true)
    private String email;

    @Column(nullable = false, length = 20, unique = true)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonIgnore // Che mật khẩu khi trả về API
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    // Thông tin bổ sung (Bạn đã thêm đúng)
    @Column(name = "date_of_birth", length = 20)
    private String dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // --- Relationships (THÊM @JsonIgnore VÀO TẤT CẢ) ---

    @JsonIgnore // <--- Thêm vào đây
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private StaffProfile staffProfile;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Vehicle> vehicles;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private Set<Appointment> appointmentsAsCustomer;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<Appointment> appointmentsAsAdvisor;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "customer")
    private Set<ServiceOrder> serviceOrdersAsCustomer;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<ServiceOrder> serviceOrdersAsAdvisor;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "technician")
    private Set<ServiceOrder> serviceOrdersAsTechnician;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "customer")
    private Set<Review> reviews;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "user")
    private Set<Notification> notifications;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "customer")
    private Set<ChatConversation> chatsAsCustomer;

    @JsonIgnore // <--- Thêm vào đây
    @OneToMany(mappedBy = "serviceAdvisor")
    private Set<ChatConversation> chatsAsAdvisor;

}