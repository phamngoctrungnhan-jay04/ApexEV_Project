package com.apexev.controller;

import com.apexev.dto.request.*;
import com.apexev.dto.response.AppointmentResponse;
import com.apexev.dto.response.QuotationResponse;
import com.apexev.dto.response.ServiceOrderResponse;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.OrderStatus;
import com.apexev.security.services.UserDetailsImpl;
import com.apexev.service.ServiceAdvisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/service-advisor")
@Validated
@Tag(name = "ServiceAdvisorController", description = "Quản lý lịch hẹn và dịch vụ bảo dưỡng")
public class ServiceAdvisorController {

    @Autowired
    private ServiceAdvisorService serviceAdvisorService;



    @GetMapping("/appointments/my-appointments")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Lấy danh sách lịch hẹn được phân công cho cố vấn")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<AppointmentResponse> appointments = serviceAdvisorService.getAppointmentsByAdvisor(userDetails.getId().longValue());
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/status/{status}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách lịch hẹn theo trạng thái")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        List<AppointmentResponse> appointments = serviceAdvisorService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/date-range")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách lịch hẹn trong khoảng thời gian")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AppointmentResponse> appointments = serviceAdvisorService.getAppointmentsByDateRange(start, end);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Lấy chi tiết lịch hẹn")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long appointmentId) {
        AppointmentResponse appointment = serviceAdvisorService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(appointment);
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Tạo lịch hẹn mới (có thể tạo thay khách hàng)")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        AppointmentResponse appointment = serviceAdvisorService.createAppointment(request, userDetails.getId().longValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @PutMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Cập nhật thông tin lịch hẹn")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody UpdateAppointmentRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        AppointmentResponse appointment = serviceAdvisorService.updateAppointment(appointmentId, request, userDetails.getId().longValue());
        return ResponseEntity.ok(appointment);
    }

    @PostMapping("/appointments/{appointmentId}/confirm")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Xác nhận lịch hẹn")
    public ResponseEntity<AppointmentResponse> confirmAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        AppointmentResponse appointment = serviceAdvisorService.confirmAppointment(appointmentId, userDetails.getId().longValue());
        return ResponseEntity.ok(appointment);
    }

    @PostMapping("/appointments/{appointmentId}/cancel")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Hủy lịch hẹn")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String reason = request.get("reason");
        AppointmentResponse appointment = serviceAdvisorService.cancelAppointment(appointmentId, userDetails.getId().longValue(), reason);
        return ResponseEntity.ok(appointment);
    }

    @PostMapping("/appointments/{appointmentId}/assign-advisor")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Phân công cố vấn cho lịch hẹn")
    public ResponseEntity<AppointmentResponse> assignAdvisorToAppointment(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, Long> request) {
        Long advisorId = request.get("advisorId");
        AppointmentResponse appointment = serviceAdvisorService.assignAdvisorToAppointment(appointmentId, advisorId);
        return ResponseEntity.ok(appointment);
    }

    // ========== SERVICE ORDER MANAGEMENT ==========

    @GetMapping("/service-orders/my-orders")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Lấy danh sách đơn dịch vụ được phân công cho cố vấn")
    public ResponseEntity<List<ServiceOrderResponse>> getMyServiceOrders(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<ServiceOrderResponse> orders = serviceAdvisorService.getServiceOrdersByAdvisor(userDetails.getId().longValue());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/service-orders/status/{status}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách đơn dịch vụ theo trạng thái")
    public ResponseEntity<List<ServiceOrderResponse>> getServiceOrdersByStatus(@PathVariable OrderStatus status) {
        List<ServiceOrderResponse> orders = serviceAdvisorService.getServiceOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/service-orders/{orderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Lấy chi tiết đơn dịch vụ")
    public ResponseEntity<ServiceOrderResponse> getServiceOrderById(@PathVariable Long orderId) {
        ServiceOrderResponse order = serviceAdvisorService.getServiceOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/service-orders/from-appointment/{appointmentId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Tạo phiếu tiếp nhận dịch vụ từ lịch hẹn")
    public ResponseEntity<ServiceOrderResponse> createServiceOrderFromAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody CreateServiceOrderRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ServiceOrderResponse order = serviceAdvisorService.createServiceOrderFromAppointment(appointmentId, request, userDetails.getId().longValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/service-orders/walk-in")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Tạo phiếu tiếp nhận dịch vụ cho khách vãng lai (không có lịch hẹn)")
    public ResponseEntity<ServiceOrderResponse> createWalkInServiceOrder(
            @Valid @RequestBody CreateServiceOrderRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ServiceOrderResponse order = serviceAdvisorService.createWalkInServiceOrder(request, userDetails.getId().longValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PutMapping("/service-orders/{orderId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Cập nhật thông tin đơn dịch vụ")
    public ResponseEntity<ServiceOrderResponse> updateServiceOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateServiceOrderRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ServiceOrderResponse order = serviceAdvisorService.updateServiceOrder(orderId, request, userDetails.getId().longValue());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/service-orders/{orderId}/notes")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Thêm ghi chú của cố vấn vào đơn dịch vụ")
    public ResponseEntity<ServiceOrderResponse> addAdvisorNotes(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String notes = request.get("notes");
        ServiceOrderResponse order = serviceAdvisorService.addAdvisorNotes(orderId, notes, userDetails.getId().longValue());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/service-orders/{orderId}/status")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Cập nhật trạng thái đơn dịch vụ")
    public ResponseEntity<ServiceOrderResponse> updateServiceOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        OrderStatus status = OrderStatus.valueOf(request.get("status"));
        ServiceOrderResponse order = serviceAdvisorService.updateServiceOrderStatus(orderId, status, userDetails.getId().longValue());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/service-orders/{orderId}/assign-technician")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Phân công kỹ thuật viên cho đơn dịch vụ")
    public ResponseEntity<ServiceOrderResponse> assignTechnicianToOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long technicianId = request.get("technicianId");
        ServiceOrderResponse order = serviceAdvisorService.assignTechnicianToOrder(orderId, technicianId, userDetails.getId().longValue());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/service-orders/{orderId}/track")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    @Operation(summary = "Theo dõi tiến độ dịch vụ")
    public ResponseEntity<ServiceOrderResponse> trackServiceProgress(@PathVariable Long orderId) {
        ServiceOrderResponse order = serviceAdvisorService.trackServiceProgress(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/service-orders/{orderId}/history")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Xem lịch sử thay đổi đơn dịch vụ")
    public ResponseEntity<List<String>> getServiceOrderHistory(@PathVariable Long orderId) {
        List<String> history = serviceAdvisorService.getServiceOrderHistory(orderId);
        return ResponseEntity.ok(history);
    }

    // ========== QUOTATION MANAGEMENT ==========

    @PostMapping("/quotations/{orderId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Tạo báo giá cho đơn dịch vụ")
    public ResponseEntity<QuotationResponse> createQuotation(
            @PathVariable Long orderId,
            @Valid @RequestBody SendQuotationRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        QuotationResponse quotation = serviceAdvisorService.createQuotation(orderId, request, userDetails.getId().longValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(quotation);
    }

    @PutMapping("/quotations/{orderId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Cập nhật báo giá")
    public ResponseEntity<QuotationResponse> updateQuotation(
            @PathVariable Long orderId,
            @Valid @RequestBody SendQuotationRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        QuotationResponse quotation = serviceAdvisorService.updateQuotation(orderId, request, userDetails.getId().longValue());
        return ResponseEntity.ok(quotation);
    }

    @PostMapping("/quotations/{orderId}/send")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    @Operation(summary = "Gửi báo giá đến khách hàng qua email")
    public ResponseEntity<QuotationResponse> sendQuotationToCustomer(
            @PathVariable Long orderId,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        QuotationResponse quotation = serviceAdvisorService.sendQuotationToCustomer(orderId, userDetails.getId().longValue());
        return ResponseEntity.ok(quotation);
    }

    @GetMapping("/quotations/{orderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN', 'BUSINESS_MANAGER')")
    @Operation(summary = "Xem báo giá của đơn dịch vụ")
    public ResponseEntity<QuotationResponse> getQuotationByOrderId(@PathVariable Long orderId) {
        QuotationResponse quotation = serviceAdvisorService.getQuotationByOrderId(orderId);
        return ResponseEntity.ok(quotation);
    }
}
