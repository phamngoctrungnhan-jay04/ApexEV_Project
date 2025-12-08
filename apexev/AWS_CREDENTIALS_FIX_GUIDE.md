# Hướng Dẫn Fix Lỗi "Invalid Security Token"

## 🔴 Vấn đề
Khi đăng ký, gặp lỗi:
```
The security token included in the request is invalid
```

## ✅ Nguyên Nhân
AWS credentials trong `.env` vẫn là placeholder:
```properties
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

## 🔧 Cách Fix

### Bước 1: Lấy AWS Access Key

1. Vào [AWS Console](https://console.aws.amazon.com)
2. Click vào tên account ở góc phải → **Security credentials**
3. Vào **Access keys** → **Create access key**
4. Chọn **Application running outside AWS**
5. Click **Create access key**
6. **Lưu lại:**
   - Access Key ID
   - Secret Access Key

⚠️ **Lưu ý:** Secret Access Key chỉ hiển thị một lần, hãy copy ngay!

---

### Bước 2: Cập nhật `.env`

Mở file `.env` và thay thế:

```properties
# ==========================================
# AWS CONFIGURATION
# ==========================================
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=apexev-media
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:apexev-email-events
```

**Thay thế:**
- `AKIAIOSFODNN7EXAMPLE` → Access Key ID của bạn
- `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` → Secret Access Key của bạn
- `YOUR_ACCOUNT_ID` → Account ID của bạn (ví dụ: 123456789012)

---

### Bước 3: Kiểm tra IAM User có quyền SNS không

1. Vào [IAM Console](https://console.aws.amazon.com/iam/)
2. Vào **Users** → Tìm user vừa tạo
3. Click vào user
4. Vào **Permissions** → Kiểm tra có `AmazonSNSFullAccess` không
5. Nếu không có, click **Add permissions** → **Attach policies** → Chọn `AmazonSNSFullAccess`

---

### Bước 4: Kiểm tra SNS Topic ARN

1. Vào [SNS Console](https://console.aws.amazon.com/sns/)
2. Vào **Topics**
3. Tìm topic `apexev-email-events`
4. Copy **Topic ARN** (ví dụ: `arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events`)
5. Cập nhật vào `.env`:
```properties
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events
```

---

### Bước 5: Restart Spring Boot

1. Dừng ứng dụng Spring Boot
2. Chạy lại:
```bash
mvn spring-boot:run
```

---

### Bước 6: Test Đăng Ký

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyen Van A",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "password123"
  }'
```

---

## 🔍 Kiểm Tra Logs

### Kiểm tra Spring Boot Logs
Tìm dòng:
```
Email event published to SNS: messageId=...
```

Nếu thấy dòng này, nghĩa là message đã được gửi lên SNS thành công.

### Kiểm tra Lambda Logs
1. Vào [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Vào **Logs** → **Log groups**
3. Tìm `/aws/lambda/apexev-email-handler`
4. Xem logs để kiểm tra Lambda có nhận được message không

### Kiểm tra SES Logs
1. Vào [SES Console](https://console.aws.amazon.com/ses/)
2. Vào **Verified identities**
3. Chọn email → **Recent delivery details**
4. Xem email có được gửi không

---

## ⚠️ Các Lỗi Thường Gặp

### 1. "Invalid security token"
**Nguyên nhân:** AWS credentials sai hoặc hết hạn
**Cách fix:** Tạo access key mới

### 2. "User is not authorized to perform: sns:Publish"
**Nguyên nhân:** IAM user không có quyền SNS
**Cách fix:** Attach `AmazonSNSFullAccess` policy

### 3. "Topic does not exist"
**Nguyên nhân:** Topic ARN sai hoặc topic chưa được tạo
**Cách fix:** Kiểm tra Topic ARN và tạo topic nếu chưa có

### 4. "Email address not verified"
**Nguyên nhân:** Email source chưa được verify trong SES
**Cách fix:** Verify email trong SES

### 5. Lambda không nhận được message
**Nguyên nhân:** Lambda chưa subscribe vào SNS Topic
**Cách fix:** Tạo SNS subscription cho Lambda

---

## 📋 Checklist

- [ ] Tạo AWS Access Key
- [ ] Cập nhật `.env` với Access Key ID
- [ ] Cập nhật `.env` với Secret Access Key
- [ ] Kiểm tra IAM user có quyền SNS
- [ ] Kiểm tra SNS Topic ARN
- [ ] Cập nhật `.env` với Topic ARN
- [ ] Restart Spring Boot
- [ ] Test đăng ký
- [ ] Kiểm tra Spring Boot logs
- [ ] Kiểm tra Lambda logs
- [ ] Kiểm tra SES logs

---

## 🎯 Quy Trình Hoàn Chỉnh

```
1. Người dùng đăng ký
   ↓
2. Spring Boot nhận request
   ↓
3. Spring Boot gửi message lên SNS (cần AWS credentials đúng)
   ↓
4. SNS nhận message
   ↓
5. SNS gửi message cho Lambda
   ↓
6. Lambda nhận message
   ↓
7. Lambda gửi email qua SES
   ↓
8. User nhận email
```

Nếu bước 3 thất bại (credentials sai), toàn bộ quy trình sẽ dừng lại.

---

## 🔐 Bảo Mật

⚠️ **QUAN TRỌNG:** Không commit file `.env` lên Git!

Thêm vào `.gitignore`:
```
.env
```

Để bảo vệ AWS credentials của bạn.
