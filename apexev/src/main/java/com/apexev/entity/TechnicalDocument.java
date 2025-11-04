// TechnicalDocument.java
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Table(name = "technical_documents")
@Getter
@Setter
@NoArgsConstructor
public class TechnicalDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doc_id")
    private Long id;

    @Nationalized
    @Column(length = 255, nullable = false)
    private String title;

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url", length = 255, nullable = false)
    private String fileUrl; // Link tới file (S3,...)

    @Column(length = 100)
    private String category;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy; // Người tải lên (Admin/Quản lý)
}