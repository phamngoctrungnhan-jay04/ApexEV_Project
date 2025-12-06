// File: FinanceStatisticsResponse.java
// DTO cho thống kê tài chính

package com.apexev.dto.response.financeAndReviewsResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceStatisticsResponse {

    // Tổng quan
    private BigDecimal totalRevenue; // Tổng doanh thu (hóa đơn đã thanh toán)
    private BigDecimal pendingAmount; // Tổng tiền chờ thanh toán
    private BigDecimal overdueAmount; // Tổng tiền quá hạn
    private BigDecimal cancelledAmount; // Tổng tiền bị hủy

    // Số lượng hóa đơn
    private Long totalInvoices;
    private Long paidInvoices;
    private Long pendingInvoices;
    private Long overdueInvoices;
    private Long cancelledInvoices;

    // Trung bình
    private BigDecimal averageInvoiceAmount; // Giá trị trung bình mỗi hóa đơn

    // So sánh với kỳ trước (tính %)
    private Double revenueGrowth; // % tăng trưởng doanh thu so với kỳ trước
    private Double invoiceGrowth; // % tăng trưởng số hóa đơn

    // Doanh thu theo tháng (cho biểu đồ)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month; // "2024-01"
        private String monthLabel; // "Tháng 1"
        private BigDecimal revenue;
        private Long invoiceCount;
    }

    private List<MonthlyRevenue> monthlyRevenues;
}
