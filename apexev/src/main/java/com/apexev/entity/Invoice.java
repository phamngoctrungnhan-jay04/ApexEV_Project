// Invoice.java
package com.apexev.entity;

import com.apexev.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long id;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @CreationTimestamp
    @Column(name = "issued_date", updatable = false)
    private LocalDateTime issuedDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    // --- Relationships ---

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private ServiceOrder serviceOrder;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private Set<Payment> payments;
}