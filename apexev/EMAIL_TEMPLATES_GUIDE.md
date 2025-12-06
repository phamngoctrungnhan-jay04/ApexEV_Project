# Email Templates Guide - ApexEV

## Tổng quan
Tất cả các email được gửi thông qua AWS SNS Topic (`apexev-email-events`) và được xử lý bởi Lambda Function (`lambda-email-handler.py`).

## Email Templates

### 1. REGISTRATION_CONFIRMATION
**Khi nào gửi:** Khi user đăng ký tài khoản  
**Gửi từ:** `UserServiceImpl.registerUser()`  
**Nội dung:**
- Chào mừng user
- Link xác nhận email (có hạn 24 giờ)
- Hướng dẫn nếu không đăng ký

**Biến cần thiết:**
- `fullName` - Tên đầy đủ
- `confirmationLink` - Link xác nhận email

---

### 2. APPOINTMENT_CONFIRMATION
**Khi nào gửi:** Khi customer đặt lịch hẹn hoặc advisor xác nhận lịch hẹn  
**Gửi từ:** `AppointmentServiceImpl.createAppointment()` và `AppointmentServiceImpl.confirmAppointment()`  
**Nội dung:**
- Xác nhận lịch hẹn
- Bảng thông tin: Ngày hẹn, Xe, Dịch vụ
- Nhắc nhở đến đúng giờ

**Biến cần thiết:**
- `fullName` - Tên khách hàng
- `appointmentDate` - Ngày giờ hẹn (định dạng: dd/MM/yyyy HH:mm)
- `vehicleInfo` - Thông tin xe (năm, hãng, model)
- `serviceType` - Loại dịch vụ

---

### 3. APPOINTMENT_REMINDER
**Khi nào gửi:** 24 giờ trước cuộc hẹn (tự động qua Scheduler)  
**Gửi từ:** `AppointmentReminderScheduler.sendAppointmentReminders()`  
**Nội dung:**
- Nhắc nhở cuộc hẹn sắp tới
- Bảng thông tin: Ngày, Giờ, Xe
- Nhắc nhở đến đúng giờ

**Biến cần thiết:**
- `fullName` - Tên khách hàng
- `appointmentDate` - Ngày hẹn (định dạng: dd/MM/yyyy)
- `appointmentTime` - Giờ hẹn (định dạng: HH:mm)
- `vehicleInfo` - Thông tin xe

---

### 4. PAYMENT_CONFIRMATION
**Khi nào gửi:** Khi hóa đơn được tạo  
**Gửi từ:** `InvoiceServiceImpl.createInvoiceFromOrder()`  
**Nội dung:**
- Xác nhận thanh toán
- Bảng thông tin: Số hóa đơn, Số tiền, Ngày thanh toán
- Cảm ơn khách hàng

**Biến cần thiết:**
- `fullName` - Tên khách hàng
- `invoiceNumber` - Số hóa đơn (định dạng: INV-{id})
- `amount` - Số tiền (kiểu Double)
- `paymentDate` - Ngày thanh toán (định dạng: dd/MM/yyyy HH:mm)

---

### 5. PAYMENT_THANK_YOU_PICKUP_REMINDER
**Khi nào gửi:** Khi thanh toán được xác nhận (markAsPaid)  
**Gửi từ:** `InvoiceServiceImpl.markAsPaid()`  
**Nội dung:**
- Cảm ơn khách hàng
- Thông tin hóa đơn
- Danh sách dịch vụ đã thực hiện
- Nhắc nhở lấy xe

**Biến cần thiết:**
- `fullName` - Tên khách hàng
- `invoiceNumber` - Số hóa đơn
- `vehicleInfo` - Thông tin xe
- `serviceDetails` - Danh sách dịch vụ (định dạng: "- SERVICE_NAME (Số lượng: X)\n")

---

### 6. PICKUP_SCHEDULE_REMINDER
**Khi nào gửi:** Khi kỹ thuật viên hoàn thành bảo dưỡng (chuyển sang READY_FOR_INVOICE)  
**Gửi từ:** `TechnicianWorkServiceImpl.updateWorkStatus()`  
**Nội dung:**
- Thông báo bảo dưỡng hoàn thành
- Thông tin xe
- **Nút CTA:** Link đặt lịch lấy xe
- Hướng dẫn liên hệ

**Biến cần thiết:**
- `fullName` - Tên khách hàng
- `vehicleInfo` - Thông tin xe
- `appointmentScheduleLink` - Link đặt lịch lấy xe (từ config: `app.appointment-schedule-link`)

---

## Cấu hình

### Java Application (application.properties)
```properties
# Link đặt lịch lấy xe
app.appointment-schedule-link=${APPOINTMENT_SCHEDULE_LINK:https://apexev.com/appointments/schedule}

# AWS SNS
aws.sns.email-topic-arn=${AWS_SNS_EMAIL_TOPIC_ARN:arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events}
```

### Lambda Function (lambda-email-handler.py)
- Đọc message từ SNS Topic
- Lấy email type từ message
- Tìm template tương ứng
- Format HTML body với dữ liệu từ message
- Gửi email qua AWS SES

---

## Flow Diagram

```
Java Application
    ↓
SNSEmailService.send*Email()
    ↓
AWS SNS Topic (apexev-email-events)
    ↓
Lambda Function (lambda-email-handler.py)
    ↓
Email Template Matching
    ↓
Format HTML Body
    ↓
AWS SES
    ↓
Customer Email
```

---

## Thêm Email Type Mới

### Bước 1: Thêm method vào SNSEmailService
```java
public void sendNewTypeEmail(String email, String fullName, String otherData) {
    Map<String, Object> emailData = new HashMap<>();
    emailData.put("type", "NEW_EMAIL_TYPE");
    emailData.put("email", email);
    emailData.put("fullName", fullName);
    emailData.put("otherData", otherData);
    emailData.put("subject", "Subject của email");
    
    publishEmailEvent(emailData);
}
```

### Bước 2: Thêm template vào lambda-email-handler.py
```python
'NEW_EMAIL_TYPE': {
    'subject': 'Subject của email',
    'html': '''
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Tiêu đề</h2>
                <p>Xin chào {fullName},</p>
                <p>Nội dung email...</p>
                <p>{otherData}</p>
                <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
            </body>
        </html>
    '''
}
```

### Bước 3: Gọi method từ Service
```java
snsEmailService.sendNewTypeEmail(email, fullName, otherData);
```

---

## Lưu ý

1. **Định dạng dữ liệu:** Đảm bảo dữ liệu được format đúng trước khi gửi (ngày giờ, số tiền, v.v.)
2. **Error Handling:** Tất cả các lệnh gửi email đều được wrap trong try-catch để không ảnh hưởng đến business logic
3. **SES Verification:** Email gửi từ (`noreply@apexev.com`) phải được verify trong AWS SES
4. **Rate Limiting:** AWS SES có giới hạn gửi email, cần monitor nếu volume cao
5. **Testing:** Có thể test bằng cách publish message trực tiếp lên SNS Topic

