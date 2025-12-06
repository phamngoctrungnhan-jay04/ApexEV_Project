package com.apexev.service.service_Interface;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;

public interface InvoiceService {
    // Tạo hóa đơn từ ServiceOrder (khi đơn hàng hoàn thành)
    InvoiceResponse createInvoiceFromOrder(Long orderId, User serviceAdvisor);
    
    // Lấy hóa đơn theo orderId
    InvoiceResponse getInvoiceByOrderId(Long orderId, User loggedInUser);
    
    // Đánh dấu hóa đơn đã thanh toán (khi customer thanh toán tiền mặt)
    InvoiceResponse markAsPaid(Long invoiceId, User serviceAdvisor);
}
