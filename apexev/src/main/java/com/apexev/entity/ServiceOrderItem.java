// ServiceOrderItem.java
package com.apexev.entity;

import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderItemType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "service_order_items")
@Getter
@Setter
@NoArgsConstructor
public class ServiceOrderItem { // form yêu cầu phụ tùng cần thay hoặc dịch vụ cần làm thêm
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", length = 50, nullable = false)
    private OrderItemType itemType; // Là 'SERVICE' hay 'PART'

    // ID tham chiếu đến 'MaintenanceService' hoặc 'Part'
    // Logic này sẽ được xử lý ở tầng Service (Business Logic)
    @Column(name = "item_ref_id", nullable = false)
    private Long itemRefId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice; // Giá tại thời điểm thêm vào

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderItemStatus status = OrderItemStatus.REQUESTED; // Trạng thái báo giá

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private ServiceOrder serviceOrder;
}