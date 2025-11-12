package com.apexev.controller.supportAndSystemController;

import com.apexev.dto.response.supportAndSystemResponse.NotificationResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    // Lấy danh sách notification của tôi
    @GetMapping("/my-notifications")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal User loggedInUser
    ) {
        List<NotificationResponse> notifications = notificationService.getMyNotifications(loggedInUser);
        return ResponseEntity.ok(notifications);
    }

    // Đếm số notification chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal User loggedInUser
    ) {
        Integer count = notificationService.countUnread(loggedInUser);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // Đánh dấu 1 notification đã đọc
    @PatchMapping("/{id}/mark-read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User loggedInUser
    ) {
        notificationService.markAsRead(id, loggedInUser);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu thông báo là đã đọc"));
    }

    // Đánh dấu tất cả notification đã đọc
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal User loggedInUser
    ) {
        notificationService.markAllAsRead(loggedInUser);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tất cả thông báo là đã đọc"));
    }
}
