# Hướng Dẫn Debug: Message Gửi Lên SNS Nhưng Không Nhận Email

## 🔍 Quy Trình Kiểm Tra

### Bước 1: Kiểm Tra Spring Boot Logs
✅ Bạn thấy: `Email event published to SNS: messageId=...`

Điều này có nghĩa:
- Spring Boot đã gửi message lên SNS thành công
- Message đã được nhận bởi SNS

**Tiếp theo:** Kiểm tra Lambda

---

### Bước 2: Kiểm Tra Lambda Logs

#### 2.1 Vào CloudWatch
1. Vào [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Vào **Logs** → **Log groups**
3. Tìm `/aws/lambda/apexev-email-handler`

#### 2.2 Xem Lambda Logs
Tìm logs gần nhất (cùng thời gian với đăng ký)

**Nếu thấy:**
```
Received event: {...}
Processing email type: REGISTRATION_CONFIRMATION
Email sent successfully. MessageId: ...
```
→ Lambda đã gửi email thành công qua SES

**Nếu thấy:**
```
Error: ...
```
→ Lambda có lỗi (xem chi tiết lỗi)

---

### Bước 3: Kiểm Tra SNS Subscription

#### 3.1 Kiểm Tra Lambda có Subscribe vào SNS không
1. Vào [SNS Console](https://console.aws.amazon.com/sns/)
2. Vào **Topics** → `apexev-email-events`
3. Vào **Subscriptions**
4. Kiểm tra có subscription với **Protocol: Lambda** không

**Nếu không có:**
→ Tạo subscription (xem hướng dẫn dưới)

#### 3.2 Kiểm Tra Subscription Status
- **Status:** `Confirmed` (xanh) → OK
- **Status:** `PendingConfirmation` (vàng) → Cần confirm

**Nếu PendingConfirmation:**
→ Lambda cần confirm subscription (xem hướng dẫn dưới)

---

### Bước 4: Kiểm Tra SES Email Delivery

#### 4.1 Vào SES Console
1. Vào [SES Console](https://console.aws.amazon.com/ses/)
2. Vào **Verified identities**
3. Chọn email: `apexevcompany@gmail.com`

#### 4.2 Xem Delivery Details
1. Click vào email
2. Vào **Recent delivery details**
3. Tìm email gần nhất

**Xem Status:**
- **Sent** → Email đã được gửi
- **Bounce** → Email không tồn tại
- **Complaint** → Email được mark as spam
- **Delivery** → Email đã được deliver

#### 4.3 Nếu Status là "Sent"
→ Email đã được gửi, kiểm tra spam folder

#### 4.4 Nếu Status là "Bounce"
→ Email address không tồn tại hoặc sai

---

## 🔧 Các Lỗi Thường Gặp & Cách Fix

### Lỗi 1: Lambda không nhận được message từ SNS

**Triệu chứng:**
- CloudWatch logs không có `/aws/lambda/apexev-email-handler`
- Hoặc logs trống

**Nguyên nhân:**
- Lambda chưa subscribe vào SNS Topic
- SNS subscription bị pending

**Cách fix:**

#### 1.1 Tạo SNS Subscription (Qua AWS Console)
1. Vào SNS → Topics → `apexev-email-events`
2. Click **Create subscription**
3. Điền:
   - **Protocol:** AWS Lambda
   - **Endpoint:** Chọn `apexev-email-handler`
4. Click **Create subscription**

#### 1.2 Tạo SNS Subscription (Qua AWS CLI)
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:ap-southeast-1:123456789012:function:apexev-email-handler \
  --region ap-southeast-1
```

#### 1.3 Cấp quyền cho SNS gọi Lambda
```bash
aws lambda add-permission \
  --function-name apexev-email-handler \
  --statement-id AllowSNSInvoke \
  --action lambda:InvokeFunction \
  --principal sns.amazonaws.com \
  --source-arn arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events \
  --region ap-southeast-1
```

---

### Lỗi 2: Lambda có lỗi khi gửi email

**Triệu chứng:**
- CloudWatch logs có error message
- Ví dụ: `MessageRejected`, `InvalidParameterValue`, etc.

**Cách fix tùy theo lỗi:**

#### 2.1 Lỗi: "MessageRejected"
**Nguyên nhân:** Email source chưa verify trong SES

**Cách fix:**
1. Vào SES → Verified identities
2. Click **Create identity**
3. Chọn **Email address**
4. Nhập: `apexevcompany@gmail.com`
5. Xác nhận email (AWS sẽ gửi link xác nhận)

#### 2.2 Lỗi: "InvalidParameterValue"
**Nguyên nhân:** Email address format sai

**Cách fix:**
- Kiểm tra email address có đúng format không
- Ví dụ: `user@example.com` (không phải `user@example`)

#### 2.3 Lỗi: "AccessDenied"
**Nguyên nhân:** Lambda IAM role không có quyền SES

**Cách fix:**
1. Vào IAM → Roles
2. Tìm Lambda execution role
3. Attach `AmazonSESFullAccess` policy

#### 2.4 Lỗi: "InvalidParameterValue: Invalid email address"
**Nguyên nhân:** Email address không hợp lệ

**Cách fix:**
- Kiểm tra email address trong message JSON
- Đảm bảo không có khoảng trắng hoặc ký tự đặc biệt

---

### Lỗi 3: Email bị vào spam

**Triệu chứng:**
- SES logs hiển thị "Sent"
- Nhưng email không ở inbox, ở spam folder

**Nguyên nhân:**
- Email content không có SPF/DKIM
- Email content có vấn đề

**Cách fix:**
1. Kiểm tra email ở spam folder
2. Mark as "Not spam"
3. Cấu hình SPF/DKIM cho domain (nếu có domain riêng)

---

### Lỗi 4: SES ở Sandbox Mode

**Triệu chứng:**
- Chỉ có thể gửi email cho verified addresses
- Không thể gửi cho email bất kỳ

**Cách fix:**
1. Vào SES → Account dashboard
2. Click **Request production access**
3. Điền form và submit
4. AWS sẽ review trong 24 giờ

---

## 📊 Debugging Checklist

### Spring Boot Phía
- [ ] Log hiển thị `Email event published to SNS: messageId=...`
- [ ] Message ID không null

### SNS Phía
- [ ] Topic `apexev-email-events` tồn tại
- [ ] Subscription với Lambda tồn tại
- [ ] Subscription status là `Confirmed`

### Lambda Phía
- [ ] Lambda function `apexev-email-handler` tồn tại
- [ ] Lambda có permission từ SNS
- [ ] CloudWatch logs có message
- [ ] Không có error trong logs

### SES Phía
- [ ] Email `apexevcompany@gmail.com` đã verify
- [ ] SES không ở Sandbox Mode (hoặc email recipient đã verify)
- [ ] SES logs hiển thị "Sent" hoặc "Delivery"

### Email Phía
- [ ] Email nhận được ở inbox
- [ ] Hoặc ở spam folder
- [ ] Hoặc bounce (email không tồn tại)

---

## 🧪 Test Lambda Trực Tiếp

### Bước 1: Tạo Test Event
1. Vào Lambda function `apexev-email-handler`
2. Click **Test**
3. Tạo test event:

```json
{
  "Records": [
    {
      "Sns": {
        "Message": "{\"type\": \"REGISTRATION_CONFIRMATION\", \"email\": \"your-email@gmail.com\", \"fullName\": \"Test User\", \"confirmationLink\": \"https://apexev.com/verify?token=abc123\"}"
      }
    }
  ]
}
```

### Bước 2: Run Test
1. Click **Test**
2. Xem kết quả

**Nếu thành công:**
- Response: `{"statusCode": 200, "body": "..."}`
- Kiểm tra email

**Nếu lỗi:**
- Xem error message
- Fix theo hướng dẫn trên

---

## 📋 Quy Trình Kiểm Tra Đầy Đủ

```
1. Đăng ký tài khoản
   ↓
2. Kiểm tra Spring Boot logs
   ✓ Thấy "Email event published to SNS"
   ↓
3. Kiểm tra SNS
   ✓ Topic tồn tại
   ✓ Subscription tồn tại
   ✓ Status: Confirmed
   ↓
4. Kiểm tra Lambda logs
   ✓ Thấy "Received event"
   ✓ Thấy "Email sent successfully"
   ↓
5. Kiểm tra SES logs
   ✓ Status: Sent hoặc Delivery
   ↓
6. Kiểm tra email
   ✓ Ở inbox hoặc spam
```

---

## 🎯 Nếu Vẫn Không Nhận Email

### Kiểm tra lần cuối:
1. **Email address đúng không?** (Kiểm tra typo)
2. **Email ở spam folder không?**
3. **SES ở Sandbox Mode không?** (Nếu có, verify recipient email)
4. **Lambda logs có error không?**
5. **SES logs hiển thị gì?** (Sent, Bounce, Complaint, Delivery)

### Nếu vẫn không được:
1. Xem CloudWatch logs chi tiết
2. Test Lambda trực tiếp
3. Kiểm tra SES delivery details
4. Liên hệ AWS Support

---

## 📚 Tham Khảo

- [CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/latest/logs/)
- [SNS Subscriptions](https://docs.aws.amazon.com/sns/latest/dg/sns-create-subscribe-endpoint-to-topic.html)
- [SES Sending](https://docs.aws.amazon.com/ses/latest/dg/send-email.html)
- [Lambda Permissions](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)
