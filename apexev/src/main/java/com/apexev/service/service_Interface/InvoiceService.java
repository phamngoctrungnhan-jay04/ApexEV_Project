package com.apexev.service.service_Interface;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.dto.response.orderResponse.OrderDetailForInvoice;
import com.apexev.dto.response.orderResponse.ServiceOrderResponse;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;

import java.util.List;

public interface InvoiceService {
    // Tạo hóa đơn từ ServiceOrder (khi đơn hàng hoàn thành)
    InvoiceResponse createInvoiceFromOrder(Long orderId, User serviceAdvisor);

    // Lấy hóa đơn theo orderId
    InvoiceResponse getInvoiceByOrderId(Long orderId, User loggedInUser);

    // Đánh dấu hóa đơn đã thanh toán (khi customer thanh toán tiền mặt)
    InvoiceResponse markAsPaid(Long invoiceId, User serviceAdvisor);

    // Lấy danh sách đơn hàng sẵn sàng xuất hóa đơn (READY_FOR_INVOICE)
    List<ServiceOrderResponse> getOrdersReadyForInvoice();

    // Lấy chi tiết đơn hàng để hiển thị trước khi xuất hóa đơn
    OrderDetailForInvoice getOrderDetailForInvoice(Long orderId);

    // Xác nhận thanh toán và giao xe cho khách hàng
    InvoiceResponse confirmPaymentAndDeliver(Long invoiceId, User serviceAdvisor);
}
