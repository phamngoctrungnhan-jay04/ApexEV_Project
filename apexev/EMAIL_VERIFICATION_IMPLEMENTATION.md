# Email Verification Implementation - ApexEV

## Tóm tắt những gì đã bổ sung

### 1. Database Schema Changes

#### User Entity - Thêm 3 fields
```java
@Column(name = "email_verified")
private boolean emailVerified = false;

@Column(name = "email_verification_token", length = 255)
private String emailVerificationToken;

@Column(name = "email_verification_token_expiry")
private LocalDateTime emailVerificationTokenExpiry;
```

#### EmailVerificationToken Entity (Mới)
```
Table: email_verification_tokens
- id (PK)
- token (UNIQUE)
- user_id (FK)
- expiry_date
- verified
- created_at
```

### 2. New Classes

#### EmailVerificationToken Entity
- Location: `src/main/java/com/apexev/entity/EmailVerificationToken.java`
- Lưu trữ token xác nhận email
- Có hạn sử dụng (expiry_date)
- Theo dõi trạng thái verified

#### EmailVerificationTokenRepository
- Location: `src/main/java/com/apexev/repository/userAndVehicle/EmailVerificationTokenRepository.java`
- Methods:
  - `findByToken(String token)` - Tìm token
  - `findByUserUserIdAndVerifiedFalse(Integer userId)` - Tìm token chưa verify
  - `deleteByExpiryDateBefore(LocalDateTime date)` - Xóa token hết hạn

#### EmailVerificationController
- Location: `src/main/java/com/apexev/controller/userAndVehicleController/EmailVerificationController.java`
- Endpoints:
  - `GET /api/auth/verify-email?token=xxx` - Xác nhận email
  - `POST /api/auth/resend-verification-email?email=xxx` - Gửi lại email

### 3. Updated Classes

#### UserServiceImpl
- Thêm 3 methods:
  - `verifyEmail(String token)` - Xác nhận email
  - `resendVerificationEmail(String email)` - Gửi lại email
  - Cập nhật `registerUser()` - Tạo token và gửi email

#### UserService Interface
- Thêm 2 method signatures:
  - `void verifyEmail(String token)`
  - `void resendVerificationEmail(String email)`

### 4. Configuration

#### application.properties
```properties
app.email-verification-expiry-hours=24
app.frontend-url=https://apexev.com
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
```

---

## Flow Diagram

### Registration Flow
```
1. User POST /api/auth/register
   ↓
2. UserServiceImpl.registerUser()
   - Validate email/phone
   - Create User (emailVerified=false)
   - Create EmailVerificationToken
   - Save to DB
   ↓
3. Send Email via SNS
   - Type: REGISTRATION_CONFIRMATION
   - Include: verification link with token
   ↓
4. Return User (emailVerified=false)
```

### Email Verification Flow
```
1. User clicks link in email
   - Link: https://apexev.com/verify-email?token=xxx
   ↓
2. Frontend calls GET /api/auth/verify-email?token=xxx
   ↓
3. UserServiceImpl.verifyEmail(token)
   - Find token in DB
   - Check if already verified
   - Check if expired
   - Update User.emailVerified = true
   - Mark token as verified
   ↓
4. Return success response
```

### Resend Email Flow
```
1. User POST /api/auth/resend-verification-email?email=xxx
   ↓
2. UserServiceImpl.resendVerificationEmail(email)
   - Find User by email
   - Check if already verified
   - Delete old token
   - Create new token
   - Send email
   ↓
3. Return success response
```

---

## API Endpoints

### 1. Verify Email
```
GET /api/auth/verify-email?token=xxx

Response (Success):
{
  "message": "Email verified successfully",
  "status": "success"
}

Response (Error):
{
  "message": "Invalid verification token" | "Verification token expired" | "Email already verified",
  "status": "error"
}
```

### 2. Resend Verification Email
```
POST /api/auth/resend-verification-email?email=user@example.com

Response (Success):
{
  "message": "Verification email sent successfully",
  "status": "success"
}

Response (Error):
{
  "message": "User not found" | "Email already verified",
  "status": "error"
}
```

---

## Email Template

### REGISTRATION_CONFIRMATION
```
Subject: Xác nhận đăng ký tài khoản ApexEV

Body:
- Chào mừng user
- Verification link (có hạn 24 giờ)
- Hướng dẫn nếu không đăng ký
```

---

## Database Migration

### SQL Script
```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verification_token_expiry DATETIME;

-- Create email_verification_tokens table
CREATE TABLE email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expiry_date DATETIME NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_token ON email_verification_tokens(token);
CREATE INDEX idx_user_verified ON email_verification_tokens(user_id, verified);
```

---

## Configuration Files

### application.properties
```properties
# Email Verification
app.email-verification-expiry-hours=24
app.frontend-url=https://apexev.com

# AWS Credentials
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
```

### application-dev.properties
```properties
app.email-verification-expiry-hours=24
app.frontend-url=http://localhost:3000
aws.access-key-id=dev-access-key
aws.secret-access-key=dev-secret-key
```

### application-prod.properties
```properties
app.email-verification-expiry-hours=24
app.frontend-url=https://apexev.com
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
```

---

## Testing

### 1. Test Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "Password123",
    "role": "CUSTOMER"
  }'
```

### 2. Test Email Verification
```bash
# Get token from email or database
curl -X GET "http://localhost:8081/api/auth/verify-email?token=YOUR_TOKEN"
```

### 3. Test Resend Email
```bash
curl -X POST "http://localhost:8081/api/auth/resend-verification-email?email=test@example.com"
```

---

## Security Considerations

1. **Token Generation**: UUID.randomUUID() - Cryptographically secure
2. **Token Expiry**: 24 hours (configurable)
3. **One-time Use**: Token marked as verified after use
4. **Rate Limiting**: Implement rate limiting on resend endpoint
5. **HTTPS Only**: Verification link should only work over HTTPS in production

---

## Maintenance Tasks

### 1. Clean up Expired Tokens
```java
// Add to a scheduled task
@Scheduled(cron = "0 0 * * * *") // Daily at midnight
public void cleanupExpiredTokens() {
    emailVerificationTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
}
```

### 2. Monitor Email Delivery
- Check CloudWatch Logs for Lambda execution
- Monitor SNS metrics
- Check SES bounce/complaint rates

---

## Future Enhancements

1. **Email Verification on Login**: Require verified email to login
2. **Resend Limit**: Limit resend attempts (e.g., 3 times per hour)
3. **Email Change Verification**: Verify new email when user changes email
4. **Two-Factor Authentication**: Add OTP verification
5. **Email Templates**: Customize email templates per language

---

## Troubleshooting

### Email not received
- Check SES verified email
- Check SNS Topic ARN
- Check Lambda logs
- Check spam folder

### Token expired
- Increase `app.email-verification-expiry-hours`
- Implement "Resend verification email" endpoint

### Token not found
- Check token format
- Check database for token
- Verify token hasn't been deleted

---

## Files Modified/Created

### Created
- `src/main/java/com/apexev/entity/EmailVerificationToken.java`
- `src/main/java/com/apexev/repository/userAndVehicle/EmailVerificationTokenRepository.java`
- `src/main/java/com/apexev/controller/userAndVehicleController/EmailVerificationController.java`
- `AWS_EMAIL_SETUP_GUIDE.md`
- `EMAIL_VERIFICATION_IMPLEMENTATION.md`

### Modified
- `src/main/java/com/apexev/entity/User.java` - Added 3 fields
- `src/main/java/com/apexev/service/serviceImpl/UserServiceImpl.java` - Added 2 methods
- `src/main/java/com/apexev/service/service_Interface/UserService.java` - Added 2 method signatures
- `src/main/resources/application.properties` - Added configuration

---

## Next Steps

1. Run database migration
2. Deploy application
3. Test registration and email verification
4. Monitor logs
5. Configure AWS SES production access if needed

