# 📧 SNS + Lambda + SES EMAIL SETUP

## 🏗️ KIẾN TRÚC

```
Spring Boot App
    ↓
SNSEmailService (Publish Event)
    ↓
SNS Topic: apexev-email-events
    ↓
Lambda Function: email-handler
    ↓
AWS SES (Send Email)
```

---

## 📋 BƯỚC 1: SETUP AWS SES

### 1.1 Verify Email Address

```bash
# Verify sender email
aws ses verify-email-identity \
  --email-address noreply@apexev.com \
  --region ap-southeast-1
```

**Hoặc qua Console:**
- SES Console → Email Addresses → Verify a New Email Address
- Nhập: `noreply@apexev.com`
- Kiểm tra email để confirm

### 1.2 Request Production Access (Optional)

Nếu muốn gửi đến nhiều người:
- SES Console → Sending Limits → Request a Sending Limit Increase
- Chọn "Production Access"

---

## 📋 BƯỚC 2: SETUP SNS TOPIC

### 2.1 Tạo SNS Topic

```bash
aws sns create-topic \
  --name apexev-email-events \
  --region ap-southeast-1
```

**Output:**
```
{
    "TopicArn": "arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events"
}
```

Lưu `TopicArn` này!

### 2.2 Cập nhật application.properties

```properties
aws.sns.email-topic-arn=arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events
```

---

## 📋 BƯỚC 3: SETUP LAMBDA FUNCTION

### 3.1 Tạo Lambda Function

```bash
# 1. Zip lambda function
cd aws-deployment
zip lambda-email-handler.zip lambda-email-handler.py

# 2. Tạo Lambda function
aws lambda create-function \
  --function-name apexev-email-handler \
  --runtime python3.11 \
  --role arn:aws:iam::029930584678:role/lambda-ses-role \
  --handler lambda-email-handler.lambda_handler \
  --zip-file fileb://lambda-email-handler.zip \
  --timeout 60 \
  --region ap-southeast-1
```

### 3.2 Tạo IAM Role cho Lambda

```bash
# 1. Tạo trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Tạo role
aws iam create-role \
  --role-name lambda-ses-role \
  --assume-role-policy-document file://trust-policy.json

# 3. Attach SES policy
aws iam attach-role-policy \
  --role-name lambda-ses-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# 4. Attach CloudWatch Logs policy
aws iam attach-role-policy \
  --role-name lambda-ses-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### 3.3 Subscribe Lambda to SNS Topic

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:ap-southeast-1:029930584678:function:apexev-email-handler \
  --region ap-southeast-1
```

### 3.4 Grant SNS Permission to Lambda

```bash
aws lambda add-permission \
  --function-name apexev-email-handler \
  --statement-id AllowSNSInvoke \
  --action lambda:InvokeFunction \
  --principal sns.amazonaws.com \
  --source-arn arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events \
  --region ap-southeast-1
```

---

## 📋 BƯỚC 4: THÊM SNS DEPENDENCY VÀO POM.XML

```xml
<!-- AWS SDK for SNS -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-sns</artifactId>
    <version>1.12.529</version>
</dependency>
```

---

## 📋 BƯỚC 5: INTEGRATE VỚI SPRING BOOT

### 5.1 Thay thế MailService

**Cũ (SMTP):**
```java
@Autowired
private MailService mailService;
mailService.sendEmail(email, subject, body);
```

**Mới (SNS):**
```java
@Autowired
private SNSEmailService snsEmailService;
snsEmailService.sendRegistrationConfirmationEmail(email, fullName, confirmationLink);
```

### 5.2 Các trường hợp sử dụng

#### 1. Khi User Đăng Ký

**File:** `UserServiceImpl.java`

```java
@Override
public User registerUser(String fullName, String email, String phone, String plainPassword, UserRole role) {
    // ... validation ...
    
    User newUser = new User();
    newUser.setFullName(fullName);
    newUser.setEmail(email);
    newUser.setPhone(phone);
    newUser.setPasswordHash(passwordEncoder.encode(plainPassword));
    newUser.setRole(role);
    
    User savedUser = userRepository.save(newUser);
    
    // Gửi email xác nhận
    String confirmationLink = "https://apexev.com/verify?token=" + generateToken(email);
    snsEmailService.sendRegistrationConfirmationEmail(email, fullName, confirmationLink);
    
    return savedUser;
}
```

#### 2. Khi Đặt Lịch Hẹn Thành Công

**File:** `AppointmentServiceImpl.java`

```java
@Transactional
public Appointment createAppointment(CreateAppointmentRequest request, User customer) {
    // ... create appointment ...
    
    Appointment appointment = appointmentRepository.save(newAppointment);
    
    // Gửi email xác nhận
    snsEmailService.sendAppointmentConfirmationEmail(
        customer.getEmail(),
        customer.getFullName(),
        appointment.getAppointmentDate().toString(),
        appointment.getVehicle().getBrand() + " " + appointment.getVehicle().getModel(),
        appointment.getServiceType()
    );
    
    return appointment;
}
```

#### 3. Nhắc Nhở Cuộc Hẹn (24 giờ trước)

**File:** `AppointmentReminderScheduler.java` (Mới tạo)

```java
@Component
@RequiredArgsConstructor
public class AppointmentReminderScheduler {
    
    private final AppointmentRepository appointmentRepository;
    private final SNSEmailService snsEmailService;
    
    @Scheduled(cron = "0 0 * * * *")  // Chạy mỗi giờ
    public void sendAppointmentReminders() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        LocalDateTime tomorrowEnd = tomorrow.plusHours(23).plusMinutes(59);
        
        List<Appointment> appointments = appointmentRepository
            .findByAppointmentDateBetween(tomorrow, tomorrowEnd);
        
        for (Appointment appointment : appointments) {
            User customer = appointment.getCustomer();
            
            snsEmailService.sendAppointmentReminderEmail(
                customer.getEmail(),
                customer.getFullName(),
                appointment.getAppointmentDate().toLocalDate().toString(),
                appointment.getAppointmentDate().toLocalTime().toString(),
                appointment.getVehicle().getBrand() + " " + appointment.getVehicle().getModel()
            );
        }
    }
}
```

#### 4. Khi Thanh Toán Thành Công

**File:** `InvoiceServiceImpl.java`

```java
@Transactional
public Invoice confirmPayment(Long invoiceId, PaymentConfirmationRequest request) {
    Invoice invoice = invoiceRepository.findById(invoiceId)
        .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
    
    invoice.setStatus(InvoiceStatus.PAID);
    invoice.setPaymentDate(LocalDateTime.now());
    
    Invoice savedInvoice = invoiceRepository.save(invoice);
    
    // Gửi email xác nhận thanh toán
    User customer = invoice.getServiceOrder().getCustomer();
    snsEmailService.sendPaymentConfirmationEmail(
        customer.getEmail(),
        customer.getFullName(),
        invoice.getInvoiceNumber(),
        invoice.getTotalAmount(),
        LocalDateTime.now().toString()
    );
    
    return savedInvoice;
}
```

---

## 🧪 TEST

### Test SNS Publishing

```bash
# Publish test message
aws sns publish \
  --topic-arn arn:aws:sns:ap-southeast-1:029930584678:apexev-email-events \
  --message '{
    "type": "REGISTRATION_CONFIRMATION",
    "email": "test@example.com",
    "fullName": "Test User",
    "confirmationLink": "https://apexev.com/verify?token=abc123",
    "subject": "Xác nhận đăng ký tài khoản ApexEV"
  }' \
  --region ap-southeast-1
```

### Check Lambda Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/apexev-email-handler --follow --region ap-southeast-1
```

---

## 📊 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│  SPRING BOOT APPLICATION                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  UserService.registerUser()                      │  │
│  │  → snsEmailService.sendRegistrationConfirmation()│  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  AWS SNS TOPIC: apexev-email-events                     │
│  (Publish email event as JSON message)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  AWS LAMBDA: apexev-email-handler                       │
│  (Triggered by SNS)                                     │
│  - Parse message                                        │
│  - Format HTML template                                 │
│  - Call SES                                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  AWS SES: Send Email                                    │
│  - From: noreply@apexev.com                             │
│  - To: customer@example.com                             │
│  - Subject: Xác nhận đăng ký...                         │
│  - Body: HTML formatted email                           │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 CHI PHÍ

- SNS: $0.50 per 1 million requests
- SES: $0.10 per 1000 emails (first 62,000 free/month)
- Lambda: $0.20 per 1 million requests (first 1M free/month)

**Ước tính:** ~$0-5/tháng

---

## ✅ CHECKLIST

- [ ] Verify SES email address
- [ ] Create SNS topic
- [ ] Create Lambda function
- [ ] Create IAM role for Lambda
- [ ] Subscribe Lambda to SNS
- [ ] Grant SNS permission to Lambda
- [ ] Add SNS dependency to pom.xml
- [ ] Create SNSEmailService
- [ ] Create SNSConfig
- [ ] Update application.properties
- [ ] Update UserService
- [ ] Create AppointmentReminderScheduler
- [ ] Update InvoiceService
- [ ] Test SNS publishing
- [ ] Check Lambda logs

Done! 🎉
