package com.apexev.dto.response.financeAndReviewsResponse;

import com.apexev.enums.InvoiceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InvoiceResponse { // chi tiết hóa đơn
    private Long id;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private LocalDateTime issuedDate;
}
