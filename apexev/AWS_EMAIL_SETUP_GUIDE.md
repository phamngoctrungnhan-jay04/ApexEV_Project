# AWS Email Setup Guide - ApexEV

## Phần 1: Cấu hình AWS (SNS + SES + Lambda)

### 1.1 Tạo AWS Account và IAM User

**Bước 1:** Đăng nhập vào AWS Console
- URL: https://console.aws.amazon.com

**Bước 2:** Tạo IAM User với quyền SNS, SES, Lambda
- Vào IAM → Users → Create User
- Tên: `apexev-app-user`
- Attach policies:
  - `AmazonSNSFullAccess`
  - `AmazonSESFullAccess`
  - `AWSLambdaFullAccess`

**Bước 3:** Tạo Access Key
- Vào Security credentials → Create access key
- Lưu: `Access Key ID` và `Secret Access Key`

---

### 1.2 Cấu hình AWS SES (Simple Email Service)

**Bước 1:** Verify Email Address
- Vào SES → Email Addresses → Verify a New Email Address
- Nhập: `noreply@apexev.com` (hoặc domain của bạn)
- Xác nhận qua email

**Bước 2:** Request Production Access (nếu cần)
- Mặc định SES ở Sandbox mode (chỉ gửi cho verified emails)
- Để gửi cho bất kỳ ai, request production access:
  - Vào SES → Sending Statistics → Request a Sending Limit Increase
  - Chọn region: `ap-southeast-1` (Singapore)

**Bước 3:** Lưu thông tin
- Region: `ap-southeast-1`
- Verified Email: `noreply@apexev.com`

---

### 1.3 Cấu hình AWS SNS (Simple Notification Service)

**Bước 1:** Tạo SNS Topic
- Vào SNS → Topics → Create Topic
- Tên: `apexev-email-events`
- Type: Standard
- Lưu ARN: `arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:apexev-email-events`

**Bước 2:** Tạo SNS Subscription (kết nối Lambda)
- Vào Topic → Create Subscription
- Protocol: AWS Lambda
- Endpoint: `arn:aws:lambda:ap-southeast-1:YOUR_ACCOUNT_ID:function:apexev-email-handler`

---

### 1.4 Cấu hình AWS Lambda

**Bước 1:** Tạo Lambda Function
- Vào Lambda → Create Function
- Tên: `apexev-email-handler`
- Runtime: Python 3.11
- Role: Tạo role mới với policies:
  - `AmazonSESFullAccess`
  - `AWSLambdaBasicExecutionRole`

**Bước 2:** Upload Code
- Copy nội dung từ `aws-deployment/lambda-email-handler.py`
- Paste vào Lambda editor
- Deploy

**Bước 3:** Cấu hình Timeout
- Vào Configuration → General Configuration
- Timeout: 30 seconds
- Memory: 256 MB

**Bước 4:** Thêm SNS Trigger
- Vào Function Overview → Add Trigger
- Source: SNS
- SNS Topic: `apexev-email-events`

---

## Phần 2: Cấu hình Java Application

### 2.1 Cập nhật application.properties

```properties
# ==========================================
# AWS CREDENTIALS
# ==========================================
aws.access-key-id=${AWS_ACCESS_KEY_ID:your-access-key}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY:your-secret-key}

# ==========================================
# AWS SNS CONFIGURATION
# ==========================================
aws.sns.region=${AWS_REGION:ap-southeast-1}
aws.sns.email-topic-arn=${AWS_SNS_EMAIL_TOPIC_ARN:arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:apexev-email-events}

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
app.appointment-schedule-link=${APPOINTMENT_SCHEDULE_LINK:https://apexev.com/appointments/schedule}
app.email-verification-expiry-hours=${EMAIL_VERIFICATION_EXPIRY:24}
```

### 2.2 Cập nhật application-dev.properties

```properties
# Development environment
aws.access-key-id=your-dev-access-key
aws.secret-access-key=your-dev-secret-key
aws.sns.region=ap-southeast-1
aws.sns.email-topic-arn=arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:apexev-email-events
app.appointment-schedule-link=http://localhost:3000/appointments/schedule
app.email-verification-expiry-hours=24
```

### 2.3 Cập nhật application-prod.properties

```properties
# Production environment
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
aws.sns.region=ap-southeast-1
aws.sns.email-topic-arn=${AWS_SNS_EMAIL_TOPIC_ARN}
app.appointment-schedule-link=https://apexev.com/appointments/schedule
app.email-verification-expiry-hours=24
```

---

## Phần 3: Bổ sung Chức năng Xác nhận Email

### 3.1 Thêm Fields vào User Entity

```java
@Column(name = "email_verified")
private boolean emailVerified = false;

@Column(name = "email_verification_token", length = 255)
private String emailVerificationToken;

@Column(name = "email_verification_token_expiry")
private LocalDateTime emailVerificationTokenExpiry;
```

### 3.2 Tạo EmailVerificationToken Entity

```java
@Entity
@Table(name = "email_verification_tokens")
@Getter
@Setter
@NoArgsConstructor
public class EmailVerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 255)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(name = "verified")
    private boolean verified = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

### 3.3 Cập nhật UserServiceImpl

```java
@Transactional
public User registerUser(String fullName, String email, String phone, String plainPassword, UserRole role) {
    // ... validation code ...
    
    User newUser = new User();
    newUser.setFullName(fullName);
    newUser.setEmail(email);
    newUser.setPhone(phone);
    newUser.setPasswordHash(passwordEncoder.encode(plainPassword));
    newUser.setRole(role);
    newUser.setActive(true);
    newUser.setEmailVerified(false); // Chưa xác nhận email
    
    User savedUser = userRepository.save(newUser);
    
    // Tạo verification token
    String verificationToken = UUID.randomUUID().toString();
    LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);
    
    EmailVerificationToken token = new EmailVerificationToken();
    token.setToken(verificationToken);
    token.setUser(savedUser);
    token.setExpiryDate(expiryDate);
    emailVerificationTokenRepository.save(token);
    
    // Gửi email xác nhận
    try {
        String verificationLink = "https://apexev.com/verify-email?token=" + verificationToken;
        snsEmailService.sendRegistrationConfirmationEmail(email, fullName, verificationLink);
        log.info("Registration confirmation email sent to: {}", email);
    } catch (Exception e) {
        log.error("Error sending registration confirmation email to: {}", email, e);
    }
    
    return savedUser;
}

@Transactional
public void verifyEmail(String token) {
    EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
    
    if (verificationToken.isVerified()) {
        throw new IllegalStateException("Email already verified");
    }
    
    if (LocalDateTime.now().isAfter(verificationToken.getExpiryDate())) {
        throw new IllegalStateException("Verification token expired");
    }
    
    User user = verificationToken.getUser();
    user.setEmailVerified(true);
    userRepository.save(user);
    
    verificationToken.setVerified(true);
    emailVerificationTokenRepository.save(verificationToken);
    
    log.info("Email verified for user: {}", user.getEmail());
}
```

### 3.4 Tạo EmailVerificationController

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EmailVerificationController {
    
    private final UserService userService;
    
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            return ResponseEntity.ok(Map.of(
                    "message", "Email verified successfully",
                    "status", "success"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid verification token",
                    "status", "error"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage(),
                    "status", "error"
            ));
        }
    }
    
    @PostMapping("/resend-verification-email")
    public ResponseEntity<?> resendVerificationEmail(@RequestParam String email) {
        try {
            userService.resendVerificationEmail(email);
            return ResponseEntity.ok(Map.of(
                    "message", "Verification email sent",
                    "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage(),
                    "status", "error"
            ));
        }
    }
}
```

---

## Phần 4: Testing

### 4.1 Test Local (Development)

**Bước 1:** Cấu hình AWS Credentials
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=ap-southeast-1
```

**Bước 2:** Chạy application
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Bước 3:** Test API
```bash
# Đăng ký
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "Password123",
    "role": "CUSTOMER"
  }'

# Xác nhận email
curl -X GET "http://localhost:8081/api/auth/verify-email?token=YOUR_TOKEN"
```

### 4.2 Test SNS Message (Manual)

**Bước 1:** Vào AWS SNS Console
- SNS → Topics → apexev-email-events → Publish message

**Bước 2:** Publish test message
```json
{
  "type": "REGISTRATION_CONFIRMATION",
  "email": "test@example.com",
  "fullName": "Test User",
  "confirmationLink": "https://apexev.com/verify?token=test-token",
  "subject": "Xác nhận đăng ký tài khoản ApexEV"
}
```

**Bước 3:** Kiểm tra Lambda logs
- Lambda → Functions → apexev-email-handler → Monitor → Logs

---

## Phần 5: Troubleshooting

### Email không gửi được

**Kiểm tra:**
1. SES verified email: `noreply@apexev.com`
2. SES region: `ap-southeast-1`
3. SNS Topic ARN đúng
4. Lambda function có SNS trigger
5. Lambda execution role có SES permissions

### Lambda timeout

**Giải pháp:**
- Tăng timeout lên 30 seconds
- Kiểm tra SES rate limit

### Token hết hạn

**Giải pháp:**
- Tăng `app.email-verification-expiry-hours` trong config
- Implement "Resend verification email" endpoint

---

## Phần 6: Production Deployment

### 6.1 Environment Variables

```bash
# Set trên AWS ECS Task Definition hoặc Lambda Environment
AWS_ACCESS_KEY_ID=prod-access-key
AWS_SECRET_ACCESS_KEY=prod-secret-key
AWS_REGION=ap-southeast-1
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:PROD_ACCOUNT_ID:apexev-email-events
APPOINTMENT_SCHEDULE_LINK=https://apexev.com/appointments/schedule
EMAIL_VERIFICATION_EXPIRY=24
```

### 6.2 Monitoring

- CloudWatch Logs: Monitor Lambda execution
- SNS Metrics: Monitor message throughput
- SES Metrics: Monitor email delivery rate

---

## Checklist

- [ ] AWS Account tạo
- [ ] IAM User tạo với access keys
- [ ] SES email verified
- [ ] SNS Topic tạo
- [ ] Lambda Function tạo và deploy
- [ ] SNS Subscription kết nối Lambda
- [ ] application.properties cấu hình
- [ ] User Entity thêm email verification fields
- [ ] EmailVerificationToken Entity tạo
- [ ] UserServiceImpl cập nhật
- [ ] EmailVerificationController tạo
- [ ] Test local
- [ ] Deploy production
- [ ] Monitor logs

