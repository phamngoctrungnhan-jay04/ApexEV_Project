// ChecklistTemplate.java (MẪU checklist do Admin tạo)
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.Set;

@Entity
@Table(name = "checklist_templates")
@Getter
@Setter
@NoArgsConstructor
public class ChecklistTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long id;

    @Nationalized
    @Column(name = "template_name", length = 255, nullable = false)
    private String templateName;

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description;

    // --- Relationships ---

    // Một mẫu có nhiều hạng mục con
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChecklistTemplateItem> items;
}