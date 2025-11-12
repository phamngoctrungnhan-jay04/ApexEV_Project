// ServiceChecklistResult.java (Kết quả của 1 hạng mục trong checklist)
package com.apexev.entity;

import com.apexev.enums.ChecklistItemStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "service_checklist_results")
@Getter
@Setter
@NoArgsConstructor
public class ServiceChecklistResult { // chứa thông tin chi tiết của cuốn sách -> khi ktv ktra xong và điền thông tin vào form và bấm nộp -> sẽ lưu vào bảng này
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private ChecklistItemStatus status; // PASSED, FAILED

    @Nationalized
    @Column(name = "technician_notes", columnDefinition = "TEXT")
    private String technicianNotes;

    @Column(name = "media_url", length = 255)
    private String mediaUrl; // Link ảnh/video bằng chứng

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private ServiceChecklist serviceChecklist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_item_id", nullable = false)
    private ChecklistTemplateItem templateItem; // Hạng mục MẪU được kiểm tra
}