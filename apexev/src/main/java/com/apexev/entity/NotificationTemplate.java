package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_templates")
@Getter
@Setter
@NoArgsConstructor
public class NotificationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long id;

    @Column(name = "template_key", length = 100, unique = true)
    private String templateKey; // unique key for template

    @Nationalized
    @Column(name = "subject", length = 255)
    private String subject;

    @Nationalized
    @Column(name = "body", columnDefinition = "TEXT")
    private String body; // supports placeholders

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
