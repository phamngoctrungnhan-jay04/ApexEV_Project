package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.coreBussinessRequest.AppointmentRequest;
import com.apexev.dto.request.coreBussinessRequest.RescheduleAppointmentRequest;
import com.apexev.dto.response.coreBussinessResponse.AppointmentResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    // Đặt lịch
    @PostMapping ("/create")
    public ResponseEntity<AppointmentResponse> createAppointment (
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User loggedInUser // lấy user đã đăng nhập
            ) {
        AppointmentResponse newAppointment = appointmentService.createAppointment(request, loggedInUser);
        return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
    }

    // Dời lịch
    @PatchMapping("/{id}/reschedule") //patch cập nhật một phần dữ liệu -> ko thay thế hết như put
    public ResponseEntity<AppointmentResponse> rescheduleAppointment (
            @PathVariable("id") Long appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequest request,
            @AuthenticationPrincipal User loggedInUser
            ) {
        AppointmentResponse updateAppointment = appointmentService.rescheduleAppointment(appointmentId, request, loggedInUser);
        return ResponseEntity.ok(updateAppointment);
    }

    // Hủy lịch - dùng patch mục đích chỉ đổi trạng thái PENDING -> CANCEL
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment (
            @PathVariable("id") Long appointmentId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        AppointmentResponse cancelledAppointment = appointmentService.cancelAppointment(appointmentId, loggedInUser);
        return ResponseEntity.ok(cancelledAppointment);
    }

    //confirm lịch hẹn bởi cố vấn
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    public ResponseEntity<AppointmentResponse> confirmAppointment (
            @PathVariable("id") Long appointmentId,
            @AuthenticationPrincipal User loggedInUser // data user cố vấn
    ) {
        AppointmentResponse confirmedAppointment = appointmentService.confirmAppointment(appointmentId, loggedInUser);
        return ResponseEntity.ok(confirmedAppointment);
    }

    //Lấy lịch hẹn theo id lịch hẹn
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById (
            @PathVariable("id") Long appointmentId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        AppointmentResponse appointmentById = appointmentService.getAppointmentById(appointmentId, loggedInUser);
        return ResponseEntity.ok(appointmentById);
    }

    // lấy lịch hẹn theo id khách hàng
    @GetMapping("/customer/{id}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN', 'BUSINESS_MANAGER')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsForCustomer (
            @PathVariable("id") Integer customerId
    ) {
        List<AppointmentResponse> appointmentsByCustomerId = appointmentService.getAppointmentsForCustomer(customerId);
        return ResponseEntity.ok(appointmentsByCustomerId);
    }

    // customer lấy xem lịch hẹn của họ
    @GetMapping("/my-appointment-customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointmentHistory (
            @AuthenticationPrincipal User loggedInUser
    ) {
        List<AppointmentResponse> myAppointment = appointmentService.getAppointmentsForCustomer(loggedInUser.getUserId());
        return ResponseEntity.ok(myAppointment);
    }

    // cố vấn lấy xem lịch hẹn của họ
    @GetMapping("/advisor/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SERVICE_ADVISOR')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsForAdvisor (
            @PathVariable("id") Integer advisorId
    ) {
        List<AppointmentResponse> getAdvisorAppointment = appointmentService.getAppointmentsForAdvisor(advisorId);
        return ResponseEntity.ok(getAdvisorAppointment);
    }

    @GetMapping("/my-appointment-advisor")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    public ResponseEntity<List<AppointmentResponse>> getMyAdvisorAppointmentHistory (
            @AuthenticationPrincipal User loggedInUser
    ) {
        List<AppointmentResponse> myAppoinment = appointmentService.getAppointmentsForAdvisor(loggedInUser.getUserId());
        return ResponseEntity.ok(myAppoinment);
    }

}
