// NotificationRepository.java
package com.apexev.repository.supportAndSystem;


import com.apexev.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Tìm thông báo của 1 user, sắp xếp mới nhất lên đầu
//    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Đếm số thông báo chưa đọc cho một user (dựa trên trường user.userId)
    long countByUserUserIdAndIsReadFalse(Integer userId);
}
