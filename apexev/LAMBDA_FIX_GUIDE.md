# Hướng Dẫn Fix Lambda Không Gửi Email

## 🔴 Vấn đề
Lambda logs hiển thị:
```
found credentials in environment variables.
```

Nhưng email vẫn không được gửi.

---

## ✅ Nguyên Nhân Có Thể

### 1. Lambda IAM Role không có quyền SES
Lambda đang dùng credentials từ environment variables, nhưng role không có quyền SES.

### 2. Lambda không nhận được message từ SNS
SNS subscription chưa được tạo hoặc bị pending.

### 3. Email source chưa verify
SES chưa verify email `apexevcompany@gmail.com`.

---

## 🔧 Cách Fix

### Bước 1: Kiểm Tra Lambda IAM Role

#### 1.1 Vào Lambda Function
1. Vào [Lambda Console](https://console.aws.amazon.com/lambda/)
2. Chọn function: `apexev-email-handler`
3. Vào **Configuration** → **Permissions**
4. Xem **Execution role**

#### 1.2 Kiểm Tra Role Permissions
1. Click vào role name
2. Vào **Permissions**
3. Kiểm tra có `AmazonSESFullAccess` không

**Nếu không có:**
1. Click **Add permissions** → **Attach policies**
2. Tìm `AmazonSESFullAccess`
3. Click **Attach policies**

---

### Bước 2: Kiểm Tra SNS Subscription

#### 2.1 Vào SNS Topic
1. Vào [SNS Console](https://console.aws.amazon.com/sns/)
2. Vào **Topics** → `apexev-email-events`
3. Vào **Subscriptions**

#### 2.2 Kiểm Tra Subscription
- **Có subscription với Lambda không?**
- **Status là gì?** (Confirmed hoặc PendingConfirmation)

**Nếu không có:**
1. Click **Create subscription**
2. **Protocol:** AWS Lambda
3. **Endpoint:** Chọn `apexev-email-handler`
4. Click **Create subscription**

**Nếu PendingConfirmation:**
1. Lambda cần confirm subscription
2. Chạy test event để trigger Lambda
3. Lambda sẽ tự động confirm

---

### Bước 3: Kiểm Tra SES Email Verification

#### 3.1 Vào SES Console
1. Vào [SES Console](https://console.aws.amazon.com/ses/)
2. Vào **Verified identities**

#### 3.2 Kiểm Tra Email
- **Có `apexevcompany@gmail.com` không?**
- **Status là gì?** (Verified hoặc Pending)

**Nếu không có hoặc Pending:**
1. Click **Create identity**
2. Chọn **Email address**
3. Nhập: `apexevcompany@gmail.com`
4. Click **Create identity**
5. AWS sẽ gửi email xác nhận
6. Click link trong email để verify

---

### Bước 4: Test Lambda Trực Tiếp

#### 4.1 Tạo Test Event
1. Vào Lambda function
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

**Lưu ý:** Thay `your-email@gmail.com` bằng email của bạn

#### 4.2 Run Test
1. Click **Test**
2. Xem kết quả

**Nếu thành công:**
```json
{
  "statusCode": 200,
  "body": "{\"message\": \"Email sent successfully\", \"messageId\": \"...\"}"
}
```

**Nếu lỗi:**
- Xem error message
- Fix theo hướng dẫn dưới

---

## 🐛 Các Lỗi Thường Gặp

### Lỗi 1: "MessageRejected"
**Nguyên nhân:** Email source chưa verify

**Cách fix:**
1. Vào SES → Verified identities
2. Verify email `apexevcompany@gmail.com`

---

### Lỗi 2: "AccessDenied"
**Nguyên nhân:** Lambda role không có quyền SES

**Cách fix:**
1. Vào Lambda → Configuration → Permissions
2. Attach `AmazonSESFullAccess` policy

---

### Lỗi 3: "InvalidParameterValue"
**Nguyên nhân:** Email address format sai

**Cách fix:**
- Kiểm tra email address trong test event
- Đảm bảo format đúng: `user@example.com`

---

### Lỗi 4: Lambda không nhận được message
**Nguyên nhân:** SNS subscription chưa được tạo

**Cách fix:**
1. Vào SNS → Topics → `apexev-email-events`
2. Tạo subscription với Lambda

---

## 📋 Checklist

- [ ] Lambda IAM role có `AmazonSESFullAccess`
- [ ] SNS subscription tồn tại
- [ ] SNS subscription status: `Confirmed`
- [ ] Email `apexevcompany@gmail.com` đã verify trong SES
- [ ] Test Lambda thành công
- [ ] Email nhận được

---

## 🧪 Test Đầy Đủ

### 1. Test Lambda Trực Tiếp
```
Lambda → Test → Run
```
✓ Thành công → Email nhận được

### 2. Test qua Spring Boot
```
POST /api/auth/register
```
✓ Thành công → Email nhận được

### 3. Kiểm Tra Logs
```
CloudWatch → /aws/lambda/apexev-email-handler
```
✓ Thấy "Email sent successfully"

---

## 🎯 Nếu Vẫn Không Được

### Kiểm tra lần cuối:
1. **Lambda logs có error không?**
2. **SES logs hiển thị gì?** (Sent, Bounce, Complaint)
3. **Email ở spam folder không?**
4. **SES ở Sandbox Mode không?**

### Nếu vẫn không được:
1. Xem CloudWatch logs chi tiết
2. Xem SES delivery details
3. Liên hệ AWS Support

---

## 📚 Tham Khảo

- [Lambda Permissions](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)
- [SNS Subscriptions](https://docs.aws.amazon.com/sns/latest/dg/sns-create-subscribe-endpoint-to-topic.html)
- [SES Verified Identities](https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html)
