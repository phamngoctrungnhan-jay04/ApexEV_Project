package com.apexev.service.serviceImpl;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.entity.Invoice;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.enums.InvoiceStatus;
import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.financeAndReviews.InvoiceRepository;
import com.apexev.service.service_Interface.InvoiceService;
import com.apexev.service.service_Interface.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public InvoiceResponse createInvoiceFromOrder(Long orderId, User serviceAdvisor) {
        // 1. Kiểm tra quyền
        if (serviceAdvisor.getRole() != UserRole.SERVICE_ADVISOR) {
            throw new AccessDeniedException("Chỉ cố vấn dịch vụ mới có thể tạo hóa đơn.");
        }

        // 2. Tìm ServiceOrder
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 3. Kiểm tra trạng thái đơn hàng phải là READY_FOR_INVOICE
        if (order.getStatus() != OrderStatus.READY_FOR_INVOICE) {
            throw new IllegalStateException("Chỉ có thể tạo hóa đơn cho đơn hàng đã sẵn sàng (READY_FOR_INVOICE).");
        }

        // 4. Kiểm tra xem đã có hóa đơn chưa
        if (order.getInvoice() != null) {
            throw new IllegalStateException("Đơn hàng này đã có hóa đơn rồi.");
        }

        // 5. Tính tổng tiền từ các ServiceOrderItem đã APPROVED
        BigDecimal totalAmount = order.getOrderItems().stream()
                .filter(item -> item.getStatus() == OrderItemStatus.APPROVED)
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6. Tạo Invoice
        Invoice invoice = new Invoice();
        invoice.setServiceOrder(order);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setDueDate(LocalDateTime.now().plusDays(7)); // Hạn thanh toán 7 ngày

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 7. Cập nhật trạng thái ServiceOrder thành COMPLETED
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);

        // 8. Gửi notification cho customer
        String message = String.format("Đơn bảo dưỡng #%d của bạn đã hoàn thành. Hóa đơn: %,.0f VNĐ. Vui lòng thanh toán trước %s.",
                order.getId(),
                totalAmount,
                invoice.getDueDate().toLocalDate().toString());
        notificationService.sendNotification(order.getCustomer(), message, order);

        return modelMapper.map(savedInvoice, InvoiceResponse.class);
    }

    @Override
    public InvoiceResponse getInvoiceByOrderId(Long orderId, User loggedInUser) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Kiểm tra quyền: chỉ customer của đơn hàng hoặc nhân viên mới xem được
        if (loggedInUser.getRole() == UserRole.CUSTOMER 
                && !order.getCustomer().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền xem hóa đơn này.");
        }

        Invoice invoice = invoiceRepository.findByServiceOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hóa đơn cho đơn hàng này."));

        return modelMapper.map(invoice, InvoiceResponse.class);
    }

    @Override
    @Transactional
    public InvoiceResponse markAsPaid(Long invoiceId, User serviceAdvisor) {
        // 1. Kiểm tra quyền
        if (serviceAdvisor.getRole() != UserRole.SERVICE_ADVISOR 
                && serviceAdvisor.getRole() != UserRole.BUSINESS_MANAGER) {
            throw new AccessDeniedException("Chỉ cố vấn dịch vụ hoặc quản lý mới có thể xác nhận thanh toán.");
        }

        // 2. Tìm Invoice
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));

        // 3. Kiểm tra trạng thái
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán rồi.");
        }

        // 4. Cập nhật trạng thái
        invoice.setStatus(InvoiceStatus.PAID);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 5. Gửi notification cho customer
        String message = String.format("Thanh toán cho đơn bảo dưỡng #%d đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!",
                invoice.getServiceOrder().getId());
        notificationService.sendNotification(invoice.getServiceOrder().getCustomer(), message, invoice.getServiceOrder());

        return modelMapper.map(savedInvoice, InvoiceResponse.class);
    }
}
