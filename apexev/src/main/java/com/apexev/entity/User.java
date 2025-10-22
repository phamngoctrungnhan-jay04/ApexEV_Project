package com.apexev.entity;

import com.apexev.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDate;
@Entity
@Data
@Table(name = "User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private Integer userId;

    @Column(name = "FullName", nullable = false, length = 100, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "Phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "PasswordHash", nullable = false, length = 255)
    private String passwordHash;
    @Nationalized

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false, length = 20)
    private UserRole role;

    @CreationTimestamp
    @Column(name = "CreatedAT")
    private LocalDate createdAt;

    @Column(name = "IsActive")
    private boolean isActive = true;

}
