// ChecklistTemplateItem.java (Hạng mục con trong MẪU)
package com.apexev.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "checklist_template_items")
@Getter
@Setter
@NoArgsConstructor
public class ChecklistTemplateItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_item_id")
    private Long id;

    @Nationalized
    @Column(name = "item_name", length = 255, nullable = false)
    private String itemName; // Ví dụ: "Kiểm tra phanh", "Kiểm tra pin"

    @Nationalized
    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ChecklistTemplate template;
}