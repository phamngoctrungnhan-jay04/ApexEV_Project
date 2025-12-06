package com.apexev.service.serviceImpl;

import com.apexev.dto.response.supportAndSystemResponse.NotificationResponse;
import com.apexev.entity.Notification;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.repository.supportAndSystem.NotificationRepository;
import com.apexev.service.service_Interface.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void sendNotification(User recipient, String message, ServiceOrder relatedOrder) {
        try {
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setMessage(message);
            notification.setRelatedOrder(relatedOrder);
            notification.setRead(false);

            notificationRepository.save(notification);
            log.info("Đã gửi notification cho user ID: {} - Message: {}", recipient.getUserId(), message);
        } catch (Exception e) {
            log.error("Lỗi khi gửi notification: {}", e.getMessage());
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }

    @Override
    @Transactional
    public void deleteAllNotifications(User loggedInUser) {
        notificationRepository.deleteByUserUserId(loggedInUser.getUserId());
        log.info("Đã xóa tất cả thông báo cho user ID: {}", loggedInUser.getUserId());
    }

    @Override
    public List<NotificationResponse> getMyNotifications(User loggedInUser) {
        List<Notification> notifications = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(loggedInUser.getUserId());

        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User loggedInUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông báo với ID: " + notificationId));

        // Kiểm tra quyền sở hữu
        if (!notification.getUser().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập thông báo này.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User loggedInUser) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(loggedInUser.getUserId())
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());

        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public Integer countUnread(User loggedInUser) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(loggedInUser.getUserId());
    }

    // Helper method để convert Entity sang DTO
    private NotificationResponse convertToDto(Notification notification) {
        NotificationResponse dto = modelMapper.map(notification, NotificationResponse.class);

        // Map relatedOrderId riêng vì ModelMapper có thể không tự động map được
        if (notification.getRelatedOrder() != null) {
            dto.setRelatedOrderId(notification.getRelatedOrder().getId());
        }

        return dto;
    }
}
