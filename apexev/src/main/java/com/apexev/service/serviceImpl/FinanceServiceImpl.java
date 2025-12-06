// File: FinanceServiceImpl.java
// Implementation của Finance Service cho quản lý tài chính

package com.apexev.service.serviceImpl;

import com.apexev.dto.response.financeAndReviewsResponse.FinanceStatisticsResponse;
import com.apexev.dto.response.financeAndReviewsResponse.InvoiceDetailResponse;
import com.apexev.entity.Invoice;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.ServiceOrderItem;
import com.apexev.entity.User;
import com.apexev.enums.InvoiceStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.financeAndReviews.InvoiceRepository;
import com.apexev.service.service_Interface.FinanceService;
import com.apexev.service.service_Interface.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

        private final InvoiceRepository invoiceRepository;
        private final NotificationService notificationService;

        @Override
        public List<InvoiceDetailResponse> getAllInvoices(String status, LocalDate startDate, LocalDate endDate) {
                List<Invoice> invoices;

                // Lọc theo status nếu có
                if (status != null && !status.isEmpty() && !status.equals("all")) {
                        try {
                                InvoiceStatus invoiceStatus = InvoiceStatus.valueOf(status.toUpperCase());
                                invoices = invoiceRepository.findByStatus(invoiceStatus);
                        } catch (IllegalArgumentException e) {
                                invoices = invoiceRepository.findAll();
                        }
                } else {
                        invoices = invoiceRepository.findAll();
                }

                // Lọc theo ngày
                if (startDate != null) {
                        invoices = invoices.stream()
                                        .filter(inv -> inv.getIssuedDate() != null &&
                                                        !inv.getIssuedDate().toLocalDate().isBefore(startDate))
                                        .collect(Collectors.toList());
                }
                if (endDate != null) {
                        invoices = invoices.stream()
                                        .filter(inv -> inv.getIssuedDate() != null &&
                                                        !inv.getIssuedDate().toLocalDate().isAfter(endDate))
                                        .collect(Collectors.toList());
                }

                // Sắp xếp theo ngày tạo mới nhất
                invoices.sort(Comparator.comparing(Invoice::getIssuedDate).reversed());

                return invoices.stream()
                                .map(this::mapToDetailResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public InvoiceDetailResponse getInvoiceDetail(Long invoiceId) {
                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn với ID: " + invoiceId));
                return mapToDetailResponse(invoice);
        }

        @Override
        public FinanceStatisticsResponse getStatistics(LocalDate startDate, LocalDate endDate) {
                List<Invoice> allInvoices = invoiceRepository.findAll();

                // Filter theo thời gian nếu có
                if (startDate != null || endDate != null) {
                        allInvoices = allInvoices.stream()
                                        .filter(inv -> {
                                                if (inv.getIssuedDate() == null)
                                                        return false;
                                                LocalDate invoiceDate = inv.getIssuedDate().toLocalDate();
                                                boolean afterStart = startDate == null
                                                                || !invoiceDate.isBefore(startDate);
                                                boolean beforeEnd = endDate == null || !invoiceDate.isAfter(endDate);
                                                return afterStart && beforeEnd;
                                        })
                                        .collect(Collectors.toList());
                }

                // Tính tổng doanh thu (PAID invoices)
                BigDecimal totalRevenue = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PAID)
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tổng tiền chờ thanh toán (PENDING)
                BigDecimal pendingAmount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING)
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tổng tiền quá hạn
                BigDecimal overdueAmount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING &&
                                                inv.getDueDate() != null &&
                                                inv.getDueDate().isBefore(LocalDateTime.now()))
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tổng tiền hủy
                BigDecimal cancelledAmount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.CANCELLED)
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Đếm số lượng hóa đơn theo trạng thái
                long totalInvoices = allInvoices.size();
                long paidInvoices = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PAID).count();
                long pendingInvoices = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING).count();
                long overdueInvoices = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING &&
                                                inv.getDueDate() != null &&
                                                inv.getDueDate().isBefore(LocalDateTime.now()))
                                .count();
                long cancelledInvoicesCount = allInvoices.stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.CANCELLED).count();

                // Giá trị trung bình
                BigDecimal averageAmount = totalInvoices > 0
                                ? totalRevenue.add(pendingAmount).divide(BigDecimal.valueOf(totalInvoices),
                                                RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                return FinanceStatisticsResponse.builder()
                                .totalRevenue(totalRevenue)
                                .pendingAmount(pendingAmount)
                                .overdueAmount(overdueAmount)
                                .cancelledAmount(cancelledAmount)
                                .totalInvoices(totalInvoices)
                                .paidInvoices(paidInvoices)
                                .pendingInvoices(pendingInvoices)
                                .overdueInvoices(overdueInvoices)
                                .cancelledInvoices(cancelledInvoicesCount)
                                .averageInvoiceAmount(averageAmount)
                                .revenueGrowth(0.0) // TODO: Tính so với kỳ trước
                                .invoiceGrowth(0.0)
                                .build();
        }

        @Override
        public List<FinanceStatisticsResponse.MonthlyRevenue> getMonthlyStatistics(int months) {
                List<FinanceStatisticsResponse.MonthlyRevenue> monthlyStats = new ArrayList<>();
                YearMonth currentMonth = YearMonth.now();

                for (int i = months - 1; i >= 0; i--) {
                        YearMonth targetMonth = currentMonth.minusMonths(i);
                        LocalDate startOfMonth = targetMonth.atDay(1);
                        LocalDate endOfMonth = targetMonth.atEndOfMonth();

                        List<Invoice> monthInvoices = invoiceRepository.findAll().stream()
                                        .filter(inv -> inv.getIssuedDate() != null &&
                                                        !inv.getIssuedDate().toLocalDate().isBefore(startOfMonth) &&
                                                        !inv.getIssuedDate().toLocalDate().isAfter(endOfMonth) &&
                                                        inv.getStatus() == InvoiceStatus.PAID)
                                        .collect(Collectors.toList());

                        BigDecimal monthRevenue = monthInvoices.stream()
                                        .map(Invoice::getTotalAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        String monthLabel = "Tháng " + targetMonth.getMonthValue();
                        String monthKey = targetMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

                        monthlyStats.add(FinanceStatisticsResponse.MonthlyRevenue.builder()
                                        .month(monthKey)
                                        .monthLabel(monthLabel)
                                        .revenue(monthRevenue)
                                        .invoiceCount((long) monthInvoices.size())
                                        .build());
                }

                return monthlyStats;
        }

        @Override
        @Transactional
        public InvoiceDetailResponse confirmPayment(Long invoiceId, String paymentMethod, User loggedInUser) {
                // Kiểm tra quyền
                if (loggedInUser.getRole() != UserRole.BUSINESS_MANAGER &&
                                loggedInUser.getRole() != UserRole.ADMIN &&
                                loggedInUser.getRole() != UserRole.SERVICE_ADVISOR) {
                        throw new AccessDeniedException("Bạn không có quyền xác nhận thanh toán.");
                }

                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn với ID: " + invoiceId));

                if (invoice.getStatus() == InvoiceStatus.PAID) {
                        throw new IllegalStateException("Hóa đơn này đã được thanh toán.");
                }

                if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
                        throw new IllegalStateException("Không thể xác nhận thanh toán cho hóa đơn đã hủy.");
                }

                invoice.setStatus(InvoiceStatus.PAID);
                Invoice savedInvoice = invoiceRepository.save(invoice);

                // Gửi notification cho customer
                if (invoice.getServiceOrder() != null && invoice.getServiceOrder().getCustomer() != null) {
                        String message = String.format(
                                        "Thanh toán cho đơn bảo dưỡng #%d đã được xác nhận. Số tiền: %,.0f VNĐ. Cảm ơn bạn!",
                                        invoice.getServiceOrder().getId(),
                                        invoice.getTotalAmount());
                        notificationService.sendNotification(
                                        invoice.getServiceOrder().getCustomer(),
                                        message,
                                        invoice.getServiceOrder());
                }

                return mapToDetailResponse(savedInvoice);
        }

        @Override
        @Transactional
        public InvoiceDetailResponse cancelInvoice(Long invoiceId, String reason, User loggedInUser) {
                // Kiểm tra quyền
                if (loggedInUser.getRole() != UserRole.BUSINESS_MANAGER &&
                                loggedInUser.getRole() != UserRole.ADMIN) {
                        throw new AccessDeniedException("Chỉ quản lý tài chính hoặc admin mới có quyền hủy hóa đơn.");
                }

                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn với ID: " + invoiceId));

                if (invoice.getStatus() == InvoiceStatus.PAID) {
                        throw new IllegalStateException("Không thể hủy hóa đơn đã thanh toán.");
                }

                if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
                        throw new IllegalStateException("Hóa đơn này đã bị hủy.");
                }

                invoice.setStatus(InvoiceStatus.CANCELLED);
                Invoice savedInvoice = invoiceRepository.save(invoice);

                // Gửi notification cho customer
                if (invoice.getServiceOrder() != null && invoice.getServiceOrder().getCustomer() != null) {
                        String message = String.format(
                                        "Hóa đơn cho đơn bảo dưỡng #%d đã bị hủy. Lý do: %s. Vui lòng liên hệ để biết thêm chi tiết.",
                                        invoice.getServiceOrder().getId(),
                                        reason != null ? reason : "Không rõ");
                        notificationService.sendNotification(
                                        invoice.getServiceOrder().getCustomer(),
                                        message,
                                        invoice.getServiceOrder());
                }

                return mapToDetailResponse(savedInvoice);
        }

        @Override
        public List<InvoiceDetailResponse> getOverdueInvoices() {
                return invoiceRepository.findAll().stream()
                                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING &&
                                                inv.getDueDate() != null &&
                                                inv.getDueDate().isBefore(LocalDateTime.now()))
                                .sorted(Comparator.comparing(Invoice::getDueDate))
                                .map(this::mapToDetailResponse)
                                .collect(Collectors.toList());
        }

        // ==================== HELPER METHODS ====================

        private InvoiceDetailResponse mapToDetailResponse(Invoice invoice) {
                ServiceOrder order = invoice.getServiceOrder();

                InvoiceDetailResponse.InvoiceDetailResponseBuilder builder = InvoiceDetailResponse.builder()
                                .id(invoice.getId())
                                .totalAmount(invoice.getTotalAmount())
                                .status(invoice.getStatus())
                                .issuedDate(invoice.getIssuedDate())
                                .dueDate(invoice.getDueDate());

                // Tính trạng thái quá hạn
                if (invoice.getStatus() == InvoiceStatus.PENDING && invoice.getDueDate() != null) {
                        boolean isOverdue = invoice.getDueDate().isBefore(LocalDateTime.now());
                        builder.isOverdue(isOverdue);
                        if (isOverdue) {
                                long daysOverdue = ChronoUnit.DAYS.between(invoice.getDueDate(), LocalDateTime.now());
                                builder.daysOverdue(daysOverdue);
                        } else {
                                builder.daysOverdue(0L);
                        }
                } else {
                        builder.isOverdue(false);
                        builder.daysOverdue(0L);
                }

                // Thông tin đơn hàng
                if (order != null) {
                        builder.orderId(order.getId())
                                        .orderStatus(order.getStatus() != null ? order.getStatus().name() : null)
                                        .orderCreatedAt(order.getCreatedAt())
                                        .orderCompletedAt(order.getCompletedAt());

                        // Thông tin khách hàng
                        if (order.getCustomer() != null) {
                                builder.customerId(order.getCustomer().getUserId().longValue())
                                                .customerName(order.getCustomer().getFullName())
                                                .customerEmail(order.getCustomer().getEmail())
                                                .customerPhone(order.getCustomer().getPhone());
                        }

                        // Thông tin xe
                        if (order.getVehicle() != null) {
                                builder.vehicleId(order.getVehicle().getId())
                                                .vehicleBrand(order.getVehicle().getBrand())
                                                .vehicleModel(order.getVehicle().getModel())
                                                .vehiclePlate(order.getVehicle().getLicensePlate());
                        }

                        // Danh sách dịch vụ
                        if (order.getOrderItems() != null) {
                                List<InvoiceDetailResponse.ServiceItemResponse> serviceItems = order.getOrderItems()
                                                .stream()
                                                .map(item -> {
                                                        // Lấy tên dịch vụ/phụ tùng từ itemType và itemRefId
                                                        String itemName = "N/A";
                                                        if (item.getItemType() != null && item.getItemRefId() != null) {
                                                                // Note: Để đơn giản, dùng itemType. Nếu cần tên thực,
                                                                // cần inject MaintenanceServiceRepository và
                                                                // PartRepository
                                                                itemName = item.getItemType().name() + " #"
                                                                                + item.getItemRefId();
                                                        }

                                                        return InvoiceDetailResponse.ServiceItemResponse.builder()
                                                                        .itemId(item.getId())
                                                                        .serviceName(itemName)
                                                                        .quantity(item.getQuantity())
                                                                        .unitPrice(item.getUnitPrice())
                                                                        .subtotal(item.getUnitPrice() != null
                                                                                        ? item.getUnitPrice().multiply(
                                                                                                        BigDecimal.valueOf(
                                                                                                                        item.getQuantity()))
                                                                                        : BigDecimal.ZERO)
                                                                        .itemStatus(item.getStatus() != null
                                                                                        ? item.getStatus().name()
                                                                                        : null)
                                                                        .build();
                                                })
                                                .collect(Collectors.toList());
                                builder.services(serviceItems);
                        }
                }

                return builder.build();
        }
}
