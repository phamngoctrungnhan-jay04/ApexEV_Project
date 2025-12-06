package com.apexev.dto.response.technicianResponse;

import com.apexev.enums.PartRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartRequestResponse {
    private Long id;

    // Part info
    private Long partId;
    private String partName;
    private String partSku;
    private BigDecimal partPrice;
    private int quantityInStock;

    // Request info
    private int quantityRequested;
    private String urgency;
    private String technicianNotes;
    private PartRequestStatus status;

    // Service Order info
    private Long serviceOrderId;
    private String vehicleLicensePlate;
    private String customerName;

    // Technician info
    private Integer technicianId;
    private String technicianName;

    // Approver info
    private Integer approvedById;
    private String approvedByName;
    private String approverNotes;
    private LocalDateTime approvedAt;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
