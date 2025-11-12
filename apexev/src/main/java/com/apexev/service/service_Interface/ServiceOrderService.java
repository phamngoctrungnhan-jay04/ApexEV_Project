package com.apexev.service.service_Interface;

import com.apexev.dto.response.coreBussinessResponse.ServiceOrderDetailResponse;
import com.apexev.dto.response.coreBussinessResponse.ServiceOrderSummaryResponse;
import com.apexev.entity.User;

import java.util.List;

public interface ServiceOrderService {
    //Lấy lịch sử bảo dưỡng (các đơn đã COMPLETED) của user đang đăng nhập
    List<ServiceOrderSummaryResponse> getMyMaintenanceHistory(User loggedInUser);

    //Lấy chi tiết đơn hàng
    public ServiceOrderDetailResponse getMyOrderDetail(Long orderId, User loggedInUser);
}
