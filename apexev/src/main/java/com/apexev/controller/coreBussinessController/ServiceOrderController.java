package com.apexev.controller.coreBussinessController;

import com.apexev.dto.response.coreBussinessResponse.ServiceOrderDetailResponse;
import com.apexev.dto.response.coreBussinessResponse.ServiceOrderSummaryResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.ServiceOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/service-orders")
public class ServiceOrderController {
    private final ServiceOrderService serviceOrderService;

    // lấy lịch sử danh sách đơn bảo dưỡng của tôi -> đã hoàn thành
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ServiceOrderSummaryResponse>> getMyHistory(
            @AuthenticationPrincipal User loggedInUser
    ) {
        List<ServiceOrderSummaryResponse> history = serviceOrderService.getMyMaintenanceHistory(loggedInUser);
        return ResponseEntity.ok(history);
    }

    // lấy chi tiết lịch sử 1 đơn bảo dưỡng của tôi -> đã hoàn thành
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ServiceOrderDetailResponse> getOrderDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User loggedInUser
    ) {
        ServiceOrderDetailResponse detail = serviceOrderService.getMyOrderDetail(id, loggedInUser);
        return ResponseEntity.ok(detail);
    }
}
