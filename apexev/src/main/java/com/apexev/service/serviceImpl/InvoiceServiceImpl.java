package com.apexev.service.serviceImpl;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.dto.response.orderResponse.OrderDetailForInvoice;
import com.apexev.dto.response.orderResponse.ServiceOrderResponse;
import com.apexev.entity.Invoice;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.ServiceOrderItem;
import com.apexev.entity.User;
import com.apexev.enums.InvoiceStatus;
import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderItemType;
import com.apexev.enums.OrderStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.financeAndReviews.InvoiceRepository;
import com.apexev.service.service_Interface.InvoiceService;
import com.apexev.service.service_Interface.NotificationService;
import com.apexev.service.serviceImpl.SNSEmailService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;
    private final SNSEmailService snsEmailService;

    @Override
    @Transactional
    public InvoiceResponse createInvoiceFromOrder(Long orderId, User serviceAdvisor) {
        // 1. Kiểm tra quyền - Cho phép SERVICE_ADVISOR, BUSINESS_MANAGER, và ADMIN
        if (serviceAdvisor.getRole() != UserRole.SERVICE_ADVISOR
                && serviceAdvisor.getRole() != UserRole.BUSINESS_MANAGER
                && serviceAdvisor.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Bạn không có quyền tạo hóa đơn.");
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
        String message = String.format(
                "Đơn bảo dưỡng #%d của bạn đã hoàn thành. Hóa đơn: %,.0f VNĐ. Vui lòng thanh toán trước %s.",
                order.getId(),
                totalAmount,
                invoice.getDueDate().toLocalDate().toString());
        notificationService.sendNotification(order.getCustomer(), message, order);

        // 9. Gửi email xác nhận hóa đơn
        try {
            String paymentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            snsEmailService.sendPaymentConfirmationEmail(
                    order.getCustomer().getEmail(),
                    order.getCustomer().getFullName(),
                    "INV-" + savedInvoice.getId(),
                    totalAmount.doubleValue(),
                    paymentDate);
            log.info("Payment confirmation email sent to: {}", order.getCustomer().getEmail());
        } catch (Exception e) {
            log.error("Error sending payment confirmation email to: {}", order.getCustomer().getEmail(), e);
        }

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
        String message = String.format(
                "Thanh toán cho đơn bảo dưỡng #%d đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!",
                invoice.getServiceOrder().getId());
        notificationService.sendNotification(invoice.getServiceOrder().getCustomer(), message,
                invoice.getServiceOrder());

        // 6. Gửi email xác nhận thanh toán
        try {
            String paymentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            snsEmailService.sendPaymentConfirmationEmail(
                    invoice.getServiceOrder().getCustomer().getEmail(),
                    invoice.getServiceOrder().getCustomer().getFullName(),
                    "INV-" + invoice.getId(),
                    invoice.getTotalAmount().doubleValue(),
                    paymentDate);
            log.info("Payment confirmation email sent to: {}", invoice.getServiceOrder().getCustomer().getEmail());
        } catch (Exception e) {
            log.error("Error sending payment confirmation email to: {}",
                    invoice.getServiceOrder().getCustomer().getEmail(), e);
        }

        return modelMapper.map(savedInvoice, InvoiceResponse.class);
    }

    @Override
    public List<ServiceOrderResponse> getOrdersReadyForInvoice() {
        // Lấy tất cả đơn hàng có status = READY_FOR_INVOICE hoặc COMPLETED (đã có
        // invoice)
        List<ServiceOrder> orders = serviceOrderRepository.findByStatusIn(
                List.of(OrderStatus.READY_FOR_INVOICE, OrderStatus.COMPLETED));

        // Map sang ServiceOrderResponse thủ công để kiểm soát dữ liệu
        return orders.stream()
                .map(order -> {
                    ServiceOrderResponse response = new ServiceOrderResponse();
                    response.setOrderId(order.getId());

                    // Thông tin customer
                    if (order.getCustomer() != null) {
                        response.setCustomerName(order.getCustomer().getFullName());
                        response.setCustomerPhone(order.getCustomer().getPhone());
                    }

                    // Thông tin vehicle
                    if (order.getVehicle() != null) {
                        response.setVehiclePlate(order.getVehicle().getLicensePlate());
                        response.setVehicleBrand(order.getVehicle().getBrand());
                        response.setVehicleModel(order.getVehicle().getModel());
                    }

                    // Tên dịch vụ chính (lấy từ orderItems đầu tiên có itemType = SERVICE)
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        response.setServiceName(
                                order.getOrderItems().stream()
                                        .filter(item -> item.getItemType() == OrderItemType.SERVICE)
                                        .findFirst()
                                        .map(item -> "Dịch vụ #" + item.getItemRefId())
                                        .orElse("Bảo dưỡng xe điện"));
                    } else {
                        response.setServiceName("N/A");
                    }

                    response.setStatus(order.getStatus());
                    response.setCompletedAt(order.getCompletedAt());

                    // Tính tổng tiền từ các item đã APPROVED
                    BigDecimal totalAmount = order.getOrderItems().stream()
                            .filter(item -> item.getStatus() == OrderItemStatus.APPROVED)
                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    response.setTotalAmount(totalAmount);

                    // Nếu có invoice, thêm thông tin invoice vào response
                    if (order.getInvoice() != null) {
                        response.setInvoiceId(order.getInvoice().getId());
                        response.setInvoiceStatus(order.getInvoice().getStatus().name());
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailForInvoice getOrderDetailForInvoice(Long orderId) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Cho phép xem chi tiết đơn hàng ở trạng thái READY_FOR_INVOICE hoặc COMPLETED
        if (order.getStatus() != OrderStatus.READY_FOR_INVOICE && order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Chỉ có thể xem chi tiết đơn hàng đã sẵn sàng xuất hóa đơn hoặc đã hoàn thành.");
        }

        OrderDetailForInvoice detail = new OrderDetailForInvoice();

        // Thông tin khách hàng
        detail.setOrderId(order.getId());
        if (order.getCustomer() != null) {
            detail.setCustomerName(order.getCustomer().getFullName());
            detail.setCustomerPhone(order.getCustomer().getPhone());
            detail.setCustomerEmail(order.getCustomer().getEmail());
        }

        // Thông tin xe
        if (order.getVehicle() != null) {
            detail.setVehiclePlate(order.getVehicle().getLicensePlate());
            detail.setVehicleBrand(order.getVehicle().getBrand());
            detail.setVehicleModel(order.getVehicle().getModel());
            detail.setVehicleVin(order.getVehicle().getVinNumber());
        }

        // Thông tin nhân viên
        if (order.getTechnician() != null) {
            detail.setTechnicianName(order.getTechnician().getFullName());
        }
        if (order.getServiceAdvisor() != null) {
            detail.setAdvisorName(order.getServiceAdvisor().getFullName());
        }

        detail.setCompletedAt(order.getCompletedAt());
        detail.setTechnicianNotes(order.getTechnicianNotes());
        detail.setAdvisorNotes(order.getAdvisorNotes());

        // Phân loại services và parts từ orderItems
        List<ServiceOrderItem> approvedItems = order.getOrderItems().stream()
                .filter(item -> item.getStatus() == OrderItemStatus.APPROVED)
                .collect(Collectors.toList());

        // Services
        List<OrderDetailForInvoice.ServiceItemDetail> services = approvedItems.stream()
                .filter(item -> item.getItemType() == OrderItemType.SERVICE)
                .map(item -> {
                    OrderDetailForInvoice.ServiceItemDetail service = new OrderDetailForInvoice.ServiceItemDetail();
                    service.setServiceId(item.getItemRefId());
                    service.setServiceName("Dịch vụ #" + item.getItemRefId());
                    service.setServiceDescription("Dịch vụ bảo dưỡng");
                    service.setPrice(item.getUnitPrice());
                    service.setQuantity(item.getQuantity());
                    service.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    return service;
                })
                .collect(Collectors.toList());
        detail.setServices(services);

        // Parts
        List<OrderDetailForInvoice.PartItemDetail> parts = approvedItems.stream()
                .filter(item -> item.getItemType() == OrderItemType.PART)
                .map(item -> {
                    OrderDetailForInvoice.PartItemDetail part = new OrderDetailForInvoice.PartItemDetail();
                    part.setPartId(item.getItemRefId());
                    part.setPartName("Phụ tùng #" + item.getItemRefId());
                    part.setPartCode("PT-" + item.getItemRefId());
                    part.setUnitPrice(item.getUnitPrice());
                    part.setQuantity(item.getQuantity());
                    part.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    part.setStatus(item.getStatus().name());
                    return part;
                })
                .collect(Collectors.toList());
        detail.setParts(parts);

        // Tính tổng
        BigDecimal totalServiceCost = services.stream()
                .map(OrderDetailForInvoice.ServiceItemDetail::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPartCost = parts.stream()
                .map(OrderDetailForInvoice.PartItemDetail::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        detail.setTotalServiceCost(totalServiceCost);
        detail.setTotalPartCost(totalPartCost);
        detail.setGrandTotal(totalServiceCost.add(totalPartCost));

        return detail;
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPaymentAndDeliver(Long invoiceId, User serviceAdvisor) {
        // 1. Kiểm tra quyền
        if (serviceAdvisor.getRole() != UserRole.SERVICE_ADVISOR
                && serviceAdvisor.getRole() != UserRole.BUSINESS_MANAGER
                && serviceAdvisor.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Bạn không có quyền xác nhận thanh toán.");
        }

        // 2. Tìm Invoice
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));

        // 3. Kiểm tra trạng thái
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được xác nhận thanh toán rồi.");
        }

        // 4. Cập nhật trạng thái Invoice thành PAID
        invoice.setStatus(InvoiceStatus.PAID);
        // Note: Invoice entity không có field paidAt, chỉ cập nhật status
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 5. Cập nhật trạng thái ServiceOrder thành COMPLETED (giao xe)
        ServiceOrder order = invoice.getServiceOrder();
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);

        // 6. Gửi thông báo cho khách hàng
        if (order.getCustomer() != null) {
            String message = "Đơn hàng #" + order.getId() + " đã được thanh toán. Xe của bạn đã sẵn sàng để lấy.";
            notificationService.sendNotification(order.getCustomer(), message, order);
        }

        log.info("✅ Invoice {} confirmed payment and vehicle delivered. Order {} completed.", invoiceId, order.getId());

        return modelMapper.map(savedInvoice, InvoiceResponse.class);
    }
}
