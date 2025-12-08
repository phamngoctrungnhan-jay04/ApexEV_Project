# Email Flow Verification - ApexEV

## Kiểm tra Luồng Gửi Mail

### 1. REGISTRATION_CONFIRMATION (Đăng ký tài khoản)

#### Flow:
```
User POST /api/auth/register
    ↓
UserServiceImpl.registerUser()
    ├─ Validate email/phone
    ├─ Create User (emailVerified=false)
    ├─ Create EmailVerificationToken
    ├─ Save to DB
    ├─ Publish UserRegisterEvent
    └─ Call SNSEmailService.sendRegistrationConfirmationEmail()
        ↓
SNSEmailService.sendRegistrationConfirmationEmail()
    ├─ Create Map with:
    │  ├─ type: "REGISTRATION_CONFIRMATION"
    │  ├─ email: user email
    │  ├─ fullName: user name
    │  ├─ confirmationLink: https://apexev.com/verify-email?token=xxx
    │  └─ subject: "Xác nhận đăng ký tài khoản ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
publishEmailEvent()
    ├─ Convert Map to JSON
    ├─ Create SNS PublishRequest
    └─ Publish to SNS Topic (apexev-email-events)
        ↓
AWS SNS Topic
    └─ Trigger Lambda Function
        ↓
Lambda (lambda-email-handler.py)
    ├─ Parse SNS message
    ├─ Get template: EMAIL_TEMPLATES['REGISTRATION_CONFIRMATION']
    ├─ Format HTML with variables
    └─ Send via SES
        ↓
AWS SES
    └─ Send email to customer
```

#### Email Template:
```html
Subject: Xác nhận đăng ký tài khoản ApexEV

Body:
- Chào mừng {fullName}
- Verification link button: {confirmationLink}
- Link hết hạn sau 24 giờ
- Hướng dẫn nếu không đăng ký
```

#### Status: ✅ **ĐÚNG** - Gửi 1 email có mã xác nhận

---

### 2. APPOINTMENT_CONFIRMATION (Xác nhận đặt lịch hẹn)

#### Flow:
```
AppointmentServiceImpl.createAppointment()
    └─ Call SNSEmailService.sendAppointmentConfirmationEmail()
        ↓
SNSEmailService.sendAppointmentConfirmationEmail()
    ├─ Create Map with:
    │  ├─ type: "APPOINTMENT_CONFIRMATION"
    │  ├─ email: customer email
    │  ├─ fullName: customer name
    │  ├─ appointmentDate: dd/MM/yyyy HH:mm
    │  ├─ vehicleInfo: year brand model
    │  ├─ serviceType: service name
    │  └─ subject: "Xác nhận đặt lịch hẹn - ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
Lambda → SES → Email
```

#### Email Template:
```html
Subject: Xác nhận đặt lịch hẹn - ApexEV

Body:
- Xác nhận lịch hẹn thành công
- Bảng thông tin:
  - Ngày hẹn: {appointmentDate}
  - Xe: {vehicleInfo}
  - Dịch vụ: {serviceType}
- Nhắc nhở đến đúng giờ
```

#### Gửi từ:
- `AppointmentServiceImpl.createAppointment()` - Khi customer tạo lịch
- `AppointmentServiceImpl.confirmAppointment()` - Khi advisor xác nhận

#### Status: ✅ **ĐÚNG**

---

### 3. APPOINTMENT_REMINDER (Nhắc nhở cuộc hẹn)

#### Flow:
```
AppointmentReminderScheduler.sendAppointmentReminders()
    (Chạy mỗi giờ - @Scheduled(cron = "0 0 * * * *"))
    ├─ Find appointments trong 24 giờ tới
    ├─ Status = CONFIRMED
    └─ Call SNSEmailService.sendAppointmentReminderEmail()
        ↓
SNSEmailService.sendAppointmentReminderEmail()
    ├─ Create Map with:
    │  ├─ type: "APPOINTMENT_REMINDER"
    │  ├─ email: customer email
    │  ├─ fullName: customer name
    │  ├─ appointmentDate: dd/MM/yyyy
    │  ├─ appointmentTime: HH:mm
    │  ├─ vehicleInfo: year brand model
    │  └─ subject: "Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
Lambda → SES → Email
```

#### Email Template:
```html
Subject: Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV

Body:
- Nhắc nhở cuộc hẹn sắp tới
- Bảng thông tin:
  - Ngày: {appointmentDate}
  - Giờ: {appointmentTime}
  - Xe: {vehicleInfo}
- Nhắc nhở đến đúng giờ
```

#### Status: ✅ **ĐÚNG**

---

### 4. PAYMENT_CONFIRMATION (Xác nhận thanh toán)

#### Flow:
```
InvoiceServiceImpl.createInvoiceFromOrder()
    └─ Call SNSEmailService.sendPaymentConfirmationEmail()
        ↓
SNSEmailService.sendPaymentConfirmationEmail()
    ├─ Create Map with:
    │  ├─ type: "PAYMENT_CONFIRMATION"
    │  ├─ email: customer email
    │  ├─ fullName: customer name
    │  ├─ invoiceNumber: INV-{id}
    │  ├─ amount: total amount (Double)
    │  ├─ paymentDate: dd/MM/yyyy HH:mm
    │  └─ subject: "Xác nhận thanh toán - ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
Lambda → SES → Email
```

#### Email Template:
```html
Subject: Xác nhận thanh toán - ApexEV

Body:
- Xác nhận thanh toán thành công
- Bảng thông tin:
  - Số hóa đơn: {invoiceNumber}
  - Số tiền: {amount:,.0f} VNĐ
  - Ngày thanh toán: {paymentDate}
- Cảm ơn khách hàng
```

#### Status: ✅ **ĐÚNG**

---

### 5. PAYMENT_THANK_YOU_PICKUP_REMINDER (Cảm ơn + Nhắc nhở lấy xe)

#### Flow:
```
InvoiceServiceImpl.markAsPaid()
    ├─ Update invoice status = PAID
    ├─ Send notification
    ├─ Call SNSEmailService.sendPaymentConfirmationEmail()
    └─ Call SNSEmailService.sendPaymentThankYouAndPickupReminderEmail()
        ↓
SNSEmailService.sendPaymentThankYouAndPickupReminderEmail()
    ├─ Create Map with:
    │  ├─ type: "PAYMENT_THANK_YOU_PICKUP_REMINDER"
    │  ├─ email: customer email
    │  ├─ fullName: customer name
    │  ├─ invoiceNumber: INV-{id}
    │  ├─ vehicleInfo: year brand model
    │  ├─ serviceDetails: "- SERVICE_NAME (Số lượng: X)\n..."
    │  └─ subject: "Cảm ơn bạn! Nhắc nhở lấy xe - ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
Lambda → SES → Email
```

#### Email Template:
```html
Subject: Cảm ơn bạn! Nhắc nhở lấy xe - ApexEV

Body:
- Cảm ơn khách hàng
- Thông tin hóa đơn:
  - Số hóa đơn: {invoiceNumber}
  - Xe: {vehicleInfo}
- Dịch vụ đã thực hiện:
  {serviceDetails}
- Nhắc nhở lấy xe
```

#### Status: ✅ **ĐÚNG** - Gửi 2 emails (PAYMENT_CONFIRMATION + PAYMENT_THANK_YOU_PICKUP_REMINDER)

---

### 6. PICKUP_SCHEDULE_REMINDER (Nhắc nhở đặt lịch lấy xe)

#### Flow:
```
TechnicianWorkServiceImpl.updateWorkStatus()
    ├─ Update status = READY_FOR_INVOICE
    └─ Call SNSEmailService.sendPickupScheduleReminderEmail()
        ↓
SNSEmailService.sendPickupScheduleReminderEmail()
    ├─ Create Map with:
    │  ├─ type: "PICKUP_SCHEDULE_REMINDER"
    │  ├─ email: customer email
    │  ├─ fullName: customer name
    │  ├─ vehicleInfo: year brand model
    │  ├─ appointmentScheduleLink: https://apexev.com/appointments/schedule
    │  └─ subject: "Nhắc nhở: Đặt lịch lấy xe tại ApexEV"
    └─ publishEmailEvent(emailData)
        ↓
Lambda → SES → Email
```

#### Email Template:
```html
Subject: Nhắc nhở: Đặt lịch lấy xe tại ApexEV

Body:
- Bảo dưỡng xe hoàn thành
- Thông tin xe: {vehicleInfo}
- Nút CTA: "Đặt Lịch Lấy Xe" → {appointmentScheduleLink}
- Hướng dẫn liên hệ
```

#### Status: ✅ **ĐÚNG**

---

## Tóm tắt Tất cả Email Types

| Email Type | Khi Gửi | Gửi Từ | Template | Status |
|---|---|---|---|---|
| REGISTRATION_CONFIRMATION | Đăng ký tài khoản | UserServiceImpl.registerUser() | ✅ Có | ✅ OK |
| APPOINTMENT_CONFIRMATION | Tạo/Xác nhận lịch hẹn | AppointmentServiceImpl | ✅ Có | ✅ OK |
| APPOINTMENT_REMINDER | 24h trước lịch hẹn | AppointmentReminderScheduler | ✅ Có | ✅ OK |
| PAYMENT_CONFIRMATION | Tạo hóa đơn | InvoiceServiceImpl.createInvoiceFromOrder() | ✅ Có | ✅ OK |
| PAYMENT_THANK_YOU_PICKUP_REMINDER | Thanh toán xác nhận | InvoiceServiceImpl.markAsPaid() | ✅ Có | ✅ OK |
| PICKUP_SCHEDULE_REMINDER | Bảo dưỡng hoàn thành | TechnicianWorkServiceImpl.updateWorkStatus() | ✅ Có | ✅ OK |

---

## Nơi Chỉnh Sửa Email Template

### 1. **Chỉnh sửa nội dung email (HTML)**
   - **File:** `aws-deployment/lambda-email-handler.py`
   - **Vị trí:** `EMAIL_TEMPLATES` dictionary
   - **Cách chỉnh sửa:**
     ```python
     EMAIL_TEMPLATES = {
         'REGISTRATION_CONFIRMATION': {
             'subject': 'Xác nhận đăng ký tài khoản ApexEV',  # ← Chỉnh subject
             'html': '''
                 <html>
                     <body>
                         <!-- ← Chỉnh HTML ở đây -->
                     </body>
                 </html>
             '''
         },
         # ... các template khác
     }
     ```

### 2. **Chỉnh sửa dữ liệu gửi email**
   - **File:** `src/main/java/com/apexev/service/serviceImpl/SNSEmailService.java`
   - **Vị trí:** Các method `send*Email()`
   - **Cách chỉnh sửa:**
     ```java
     public void sendRegistrationConfirmationEmail(String email, String fullName, String confirmationLink) {
         Map<String, Object> emailData = new HashMap<>();
         emailData.put("type", "REGISTRATION_CONFIRMATION");
         emailData.put("email", email);
         emailData.put("fullName", fullName);
         emailData.put("confirmationLink", confirmationLink);
         emailData.put("subject", "Xác nhận đăng ký tài khoản ApexEV");
         // ← Thêm/sửa dữ liệu ở đây
         
         publishEmailEvent(emailData);
     }
     ```

### 3. **Chỉnh sửa khi gửi email**
   - **File:** Các ServiceImpl (UserServiceImpl, AppointmentServiceImpl, InvoiceServiceImpl, TechnicianWorkServiceImpl)
   - **Cách chỉnh sửa:**
     ```java
     // Ví dụ: UserServiceImpl.registerUser()
     try {
         String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;
         snsEmailService.sendRegistrationConfirmationEmail(email, fullName, verificationLink);
         // ← Chỉnh dữ liệu trước khi gửi
     } catch (Exception e) {
         log.error("Error sending registration confirmation email to: {}", email, e);
     }
     ```

---

## Quy Trình Chỉnh Sửa Email

### Ví dụ: Chỉnh sửa email REGISTRATION_CONFIRMATION

**Bước 1:** Mở file `aws-deployment/lambda-email-handler.py`

**Bước 2:** Tìm template:
```python
'REGISTRATION_CONFIRMATION': {
    'subject': 'Xác nhận đăng ký tài khoản ApexEV',
    'html': '''
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Chào mừng đến với ApexEV!</h2>
                <p>Xin chào {fullName},</p>
                <!-- Chỉnh sửa ở đây -->
            </body>
        </html>
    '''
}
```

**Bước 3:** Chỉnh sửa HTML/Subject

**Bước 4:** Deploy Lambda function

**Bước 5:** Test bằng cách đăng ký tài khoản mới

---

## Kiểm tra Email Đã Gửi

### 1. **Kiểm tra CloudWatch Logs**
   - Vào AWS Console → CloudWatch → Logs
   - Tìm log group: `/aws/lambda/apexev-email-handler`
   - Xem logs để kiểm tra email đã gửi

### 2. **Kiểm tra SNS Metrics**
   - Vào AWS Console → SNS → Topics
   - Chọn topic: `apexev-email-events`
   - Xem metrics: Messages Published, Messages Delivered

### 3. **Kiểm tra SES Metrics**
   - Vào AWS Console → SES → Sending Statistics
   - Xem: Bounces, Complaints, Delivery Rate

---

## Troubleshooting

### Email không gửi được
1. Kiểm tra SES verified email: `noreply@apexev.com`
2. Kiểm tra SNS Topic ARN đúng
3. Kiểm tra Lambda function có SNS trigger
4. Kiểm tra Lambda execution role có SES permissions
5. Xem CloudWatch Logs để tìm lỗi

### Email template không đúng
1. Kiểm tra biến trong template: `{fullName}`, `{email}`, etc.
2. Kiểm tra dữ liệu gửi từ Java có đúng key không
3. Kiểm tra HTML syntax

### Email bị spam
1. Kiểm tra SES reputation
2. Thêm SPF/DKIM records
3. Kiểm tra email content

---

## Kết Luận

✅ **Luồng gửi mail ĐÚNG:**
- Đăng ký: Gửi 1 email có mã xác nhận
- Đặt lịch: Gửi email xác nhận
- Nhắc nhở: Gửi email nhắc nhở 24h trước
- Thanh toán: Gửi 2 emails (xác nhận + cảm ơn + nhắc nhở lấy xe)
- Bảo dưỡng hoàn thành: Gửi email nhắc nhở đặt lịch lấy xe

✅ **Tất cả email templates đã có**

✅ **Chỉnh sửa email template:** `aws-deployment/lambda-email-handler.py`

