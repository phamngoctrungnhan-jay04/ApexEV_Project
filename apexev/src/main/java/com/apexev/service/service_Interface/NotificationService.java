package com.apexev.service.service_Interface;

import com.apexev.dto.response.supportAndSystemResponse.NotificationResponse;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;

import java.util.List;

public interface NotificationService {
    // Tạo và gửi notification
    void sendNotification(User recipient, String message, ServiceOrder relatedOrder);
    
    // Lấy danh sách notification của user
    List<NotificationResponse> getMyNotifications(User loggedInUser);
    
    // Đánh dấu đã đọc
    void markAsRead(Long notificationId, User loggedInUser);
    
    // Đánh dấu tất cả đã đọc
    void markAllAsRead(User loggedInUser);
    
    // Đếm số notification chưa đọc
    Integer countUnread(User loggedInUser);
}
