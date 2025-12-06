// File: FinanceService.java
// Interface cho Finance Service

package com.apexev.service.service_Interface;

import com.apexev.dto.response.financeAndReviewsResponse.FinanceStatisticsResponse;
import com.apexev.dto.response.financeAndReviewsResponse.InvoiceDetailResponse;
import com.apexev.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface FinanceService {

    // Lấy tất cả hóa đơn (filter theo status và ngày)
    List<InvoiceDetailResponse> getAllInvoices(String status, LocalDate startDate, LocalDate endDate);

    // Lấy chi tiết hóa đơn
    InvoiceDetailResponse getInvoiceDetail(Long invoiceId);

    // Lấy thống kê tài chính
    FinanceStatisticsResponse getStatistics(LocalDate startDate, LocalDate endDate);

    // Lấy thống kê theo tháng
    List<FinanceStatisticsResponse.MonthlyRevenue> getMonthlyStatistics(int months);

    // Xác nhận thanh toán
    InvoiceDetailResponse confirmPayment(Long invoiceId, String paymentMethod, User loggedInUser);

    // Hủy hóa đơn
    InvoiceDetailResponse cancelInvoice(Long invoiceId, String reason, User loggedInUser);

    // Lấy hóa đơn quá hạn
    List<InvoiceDetailResponse> getOverdueInvoices();
}
