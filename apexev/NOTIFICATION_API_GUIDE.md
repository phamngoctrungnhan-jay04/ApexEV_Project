# Hướng dẫn sử dụng Notification API

## Tổng quan
Hệ thống Notification đã được tích hợp vào các luồng nghiệp vụ chính:
- **Đặt lịch hẹn** (Appointment)
- **Xác nhận lịch hẹn** (Confirm Appointment)
- **Hoàn thành bảo dưỡng và tạo hóa đơn** (Invoice Created)
- **Thanh toán** (Payment Confirmed)

## API Endpoints

### 1. Lấy danh sách notification của tôi
```
GET /api/notifications/my-notifications
```
**Authorization**: Bearer Token (tất cả các role)

**Response**:
```json
[
  {
    "id": 1,
    "message": "Lịch hẹn của bạn đã được tạo thành công vào lúc 2024-11-10T10:00:00. Vui lòng chờ cố vấn xác nhận.",
    "isRead": false,
    "createdAt": "2024-11-09T14:30:00",
    "relatedOrderId": null
  },
  {
    "id": 2,
    "message": "Đơn bảo dưỡng #5 của bạn đã hoàn thành. Hóa đơn: 900,000 VNĐ. Vui lòng thanh toán trước 2024-11-16.",
    "isRead": false,
    "createdAt": "2024-11-09T16:00:00",
    "relatedOrderId": 5
  }
]
```

### 2. Đếm số notification chưa đọc
```
GET /api/notifications/unread-count
```
**Authorization**: Bearer Token (tất cả các role)

**Response**:
```json
{
  "unreadCount": 3
}
```

### 3. Đánh dấu 1 notification đã đọc
```
PATCH /api/notifications/{id}/mark-read
```
**Authorization**: Bearer Token (tất cả các role)

**Response**:
```json
{
  "message": "Đã đánh dấu thông báo là đã đọc"
}
```

### 4. Đánh dấu tất cả notification đã đọc
```
PATCH /api/notifications/mark-all-read
```
**Authorization**: Bearer Token (tất cả các role)

**Response**:
```json
{
  "message": "Đã đánh dấu tất cả thông báo là đã đọc"
}
```

## Invoice API Endpoints (Mới)

### 1. Tạo hóa đơn từ ServiceOrder
```
POST /api/invoices/create-from-order/{orderId}
```
**Authorization**: Bearer Token (SERVICE_ADVISOR)

**Điều kiện**:
- ServiceOrder phải ở trạng thái `READY_FOR_INVOICE`
- Chưa có hóa đơn cho đơn hàng này

**Kết quả**:
- Tạo Invoice với tổng tiền từ các ServiceOrderItem đã APPROVED
- Chuyển ServiceOrder sang trạng thái `COMPLETED`
- Gửi notification cho customer

### 2. Lấy hóa đơn theo orderId
```
GET /api/invoices/order/{orderId}
```
**Authorization**: Bearer Token (Customer của đơn hàng hoặc nhân viên)

### 3. Đánh dấu hóa đơn đã thanh toán
```
PATCH /api/invoices/{invoiceId}/mark-paid
```
**Authorization**: Bearer Token (SERVICE_ADVISOR hoặc BUSINESS_MANAGER)

**Kết quả**:
- Chuyển Invoice sang trạng thái `PAID`
- Gửi notification cho customer xác nhận thanh toán

## Luồng nghiệp vụ với Notification

### 1. Khi Customer đặt lịch hẹn
```
POST /api/appointments/create
```
→ **Notification gửi cho Customer**: "Lịch hẹn của bạn đã được tạo thành công vào lúc [thời gian]. Vui lòng chờ cố vấn xác nhận."

### 2. Khi Cố vấn xác nhận lịch hẹn
```
PATCH /api/appointments/{id}/confirm
```
→ **Notification gửi cho Customer**: "Lịch hẹn của bạn vào lúc [thời gian] đã được xác nhận bởi cố vấn [tên cố vấn]."

### 3. Khi Cố vấn tạo hóa đơn (sau khi kỹ thuật viên hoàn thành)
```
POST /api/invoices/create-from-order/{orderId}
```
→ **Notification gửi cho Customer**: "Đơn bảo dưỡng #[ID] của bạn đã hoàn thành. Hóa đơn: [số tiền] VNĐ. Vui lòng thanh toán trước [ngày]."

### 4. Khi Cố vấn xác nhận thanh toán (tiền mặt)
```
PATCH /api/invoices/{invoiceId}/mark-paid
```
→ **Notification gửi cho Customer**: "Thanh toán cho đơn bảo dưỡng #[ID] đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!"

## Cấu trúc Database

### Bảng `notifications`
```sql
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    related_order_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (related_order_id) REFERENCES service_orders(order_id)
);
```

## Các file đã tạo/sửa

### Files mới:
1. `NotificationService.java` - Interface service
2. `NotificationServiceImpl.java` - Implementation với logic gửi notification
3. `NotificationController.java` - REST API endpoints
4. `NotificationResponse.java` - DTO response
5. `InvoiceService.java` - Interface service cho Invoice
6. `InvoiceServiceImpl.java` - Implementation với logic tạo hóa đơn và thanh toán
7. `InvoiceController.java` - REST API endpoints cho Invoice

### Files đã sửa:
1. `AppointmentServiceImpl.java` - Thêm gửi notification khi:
   - Tạo lịch hẹn mới
   - Xác nhận lịch hẹn

## Lưu ý khi sử dụng

1. **Notification không làm gián đoạn flow chính**: Nếu có lỗi khi gửi notification, hệ thống sẽ log lỗi nhưng không throw exception để không ảnh hưởng đến nghiệp vụ chính.

2. **relatedOrderId**: Trường này giúp frontend có thể tạo link trực tiếp đến đơn hàng liên quan khi user click vào notification.

3. **isRead flag**: Frontend nên gọi API `mark-read` khi user xem notification để cập nhật trạng thái.

4. **Real-time**: Hiện tại notification chỉ được lưu vào database. Để có real-time notification, cần tích hợp WebSocket hoặc Server-Sent Events (SSE).

## Mở rộng trong tương lai

1. **WebSocket/SSE**: Để push notification real-time cho client
2. **Email notification**: Gửi email song song với notification trong app
3. **SMS notification**: Cho các sự kiện quan trọng
4. **Notification templates**: Tạo template để dễ quản lý nội dung
5. **Notification preferences**: Cho phép user chọn loại notification muốn nhận
