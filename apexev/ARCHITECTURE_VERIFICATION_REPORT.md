# Báo Cáo Kiểm Tra Kiến Trúc Email (SNS → Lambda → SES)

## ✅ Những gì đã được thực hiện đúng

### 1. SNSEmailService (✅ Đúng)
- **File:** `src/main/java/com/apexev/service/serviceImpl/SNSEmailService.java`
- **Chức năng:** Gửi message lên SNS Topic
- **Chi tiết:**
  - Tạo JSON message với trường `type` (REGISTRATION_CONFIRMATION, APPOINTMENT_REMINDER, etc.)
  - Gọi `snsClient.publish()` để gửi lên SNS Topic
  - Xử lý exception và log

```java
PublishRequest publishRequest = new PublishRequest()
    .withTopicArn(emailTopicArn)
    .withMessage(messageBody)
    .withSubject((String) emailData.get("subject"));

PublishResult result = snsClient.publish(publishRequest);
```

**Kết luận:** ✅ Đúng theo kiến trúc

---

### 2. UserServiceImpl (✅ Đúng)
- **File:** `src/main/java/com/apexev/service/serviceImpl/UserServiceImpl.java`
- **Chức năng:** Gọi SNSEmailService khi người dùng đăng ký
- **Chi tiết:**
  - Lưu user vào database
  - Tạo verification token
  - Gọi `snsEmailService.sendRegistrationConfirmationEmail()`

```java
snsEmailService.sendRegistrationConfirmationEmail(email, fullName, verificationLink);
```

**Kết luận:** ✅ Đúng theo kiến trúc

---

### 3. SNSConfig (✅ Đúng)
- **File:** `src/main/java/com/apexev/config/SNSConfig.java`
- **Chức năng:** Cấu hình AmazonSNS client
- **Chi tiết:**
  - Tạo BasicAWSCredentials từ AWS Access Key
  - Build AmazonSNSClient với region

```java
@Bean
public AmazonSNS amazonSNS() {
    BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
    return AmazonSNSClientBuilder
            .standard()
            .withRegion(region)
            .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
            .build();
}
```

**Kết luận:** ✅ Đúng theo kiến trúc

---

### 4. Application Properties (✅ Đúng)
- **File:** `src/main/resources/application.properties`
- **Cấu hình:**
  - `aws.sns.region` - Region SNS
  - `aws.sns.email-topic-arn` - Topic ARN
  - `aws.access-key-id` - AWS Access Key
  - `aws.secret-access-key` - AWS Secret Key

**Kết luận:** ✅ Đúng theo kiến trúc

---

## ⚠️ Những gì cần hoàn thành

### 1. AWS Lambda Function (❌ Chưa có)
**Cần tạo:** Lambda function để nhận message từ SNS và gửi email qua SES

**Bước 1:** Tạo Lambda function
- Vào AWS Console → Lambda → Create function
- Tên: `apexev-email-handler`
- Runtime: Python 3.11
- Role: Tạo role mới với quyền SES

**Bước 2:** Paste code Python:

```python
import json
import boto3
import logging

ses_client = boto3.client('ses', region_name='ap-southeast-1')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

EMAIL_TEMPLATES = {
    'REGISTRATION_CONFIRMATION': {
        'subject': 'Xác nhận đăng ký tài khoản ApexEV',
        'html': '''
            <html>
                <body>
                    <h2>Xác nhận đăng ký tài khoản ApexEV</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản ApexEV!</p>
                    <p><a href="{confirmationLink}">Xác nhận email của bạn</a></p>
                </body>
            </html>
        '''
    },
    'APPOINTMENT_CONFIRMATION': {
        'subject': 'Xác nhận đặt lịch hẹn - ApexEV',
        'html': '''
            <html>
                <body>
                    <h2>Xác nhận đặt lịch hẹn</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Lịch hẹn của bạn: {appointmentDate}</p>
                    <p>Xe: {vehicleInfo}</p>
                    <p>Dịch vụ: {serviceType}</p>
                </body>
            </html>
        '''
    },
    'APPOINTMENT_REMINDER': {
        'subject': 'Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV',
        'html': '''
            <html>
                <body>
                    <h2>Nhắc nhở cuộc hẹn</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Cuộc hẹn của bạn vào lúc {appointmentTime} ngày {appointmentDate}</p>
                    <p>Xe: {vehicleInfo}</p>
                </body>
            </html>
        '''
    },
    'PAYMENT_CONFIRMATION': {
        'subject': 'Xác nhận thanh toán - ApexEV',
        'html': '''
            <html>
                <body>
                    <h2>Xác nhận thanh toán</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Hóa đơn: {invoiceNumber}</p>
                    <p>Số tiền: {amount} VND</p>
                    <p>Ngày thanh toán: {paymentDate}</p>
                </body>
            </html>
        '''
    }
}

def lambda_handler(event, context):
    try:
        # Parse SNS message
        message = json.loads(event['Records'][0]['Sns']['Message'])
        
        email = message.get('email')
        email_type = message.get('type')
        
        # Lấy template
        template = EMAIL_TEMPLATES.get(email_type)
        if not template:
            logger.error(f"Unknown email type: {email_type}")
            return {'statusCode': 400, 'body': 'Unknown email type'}
        
        # Thay thế placeholder
        html_body = template['html']
        for key, value in message.items():
            html_body = html_body.replace('{' + key + '}', str(value))
        
        # Gửi email qua SES
        response = ses_client.send_email(
            Source='apexevcompany@gmail.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': template['subject']},
                'Body': {'Html': {'Data': html_body}}
            }
        )
        
        logger.info(f"Email sent: {response['MessageId']}")
        return {'statusCode': 200, 'body': 'Email sent successfully'}
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {'statusCode': 500, 'body': str(e)}
```

**Bước 3:** Subscribe Lambda vào SNS Topic
- Vào SNS → Topics → `apexev-email-events`
- Click **Create subscription**
- Protocol: **AWS Lambda**
- Endpoint: Chọn Lambda function vừa tạo

---

### 2. SNS Topic (❌ Chưa tạo)
**Cần tạo:** SNS Topic để nhận message từ Spring Boot

**Bước 1:** Vào AWS Console → SNS → Topics
**Bước 2:** Click **Create topic**
- Tên: `apexev-email-events`
- Type: **Standard**

**Bước 3:** Lưu Topic ARN (ví dụ: `arn:aws:sns:ap-southeast-1:123456789:apexev-email-events`)

**Bước 4:** Cập nhật `.env`:
```
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789:apexev-email-events
```

---

### 3. SES Verification (❌ Chưa verify)
**Cần làm:** Verify email trong SES

**Bước 1:** Vào AWS Console → SES → Verified identities
**Bước 2:** Click **Create identity**
**Bước 3:** Chọn **Email address** → Nhập `apexevcompany@gmail.com`
**Bước 4:** Xác nhận email (AWS sẽ gửi link xác nhận)

---

## 📊 Sơ đồ Kiến Trúc Hiện Tại

```
Frontend (ReactJS)
    ↓
POST /api/auth/register
    ↓
UserServiceImpl.registerUser()
    ↓
SNSEmailService.sendRegistrationConfirmationEmail()
    ↓
AmazonSNS.publish() → SNS Topic
    ↓
[CHƯA CÓ] Lambda Function
    ↓
[CHƯA CÓ] SES.send_email()
    ↓
User Email
```

---

## ✅ Checklist Hoàn Thành

- [x] SNSEmailService - Gửi message lên SNS
- [x] UserServiceImpl - Gọi SNSEmailService
- [x] SNSConfig - Cấu hình AmazonSNS client
- [x] Application Properties - Cấu hình SNS Topic ARN
- [ ] **Lambda Function - Nhận message từ SNS**
- [ ] **SNS Topic - Tạo topic**
- [ ] **SES Verification - Verify email**
- [ ] **Lambda IAM Role - Quyền SES**
- [ ] **SNS Subscription - Subscribe Lambda vào Topic**

---

## 🎯 Kết Luận

**Dự án của bạn đang làm theo kiến trúc SNS → Lambda → SES, nhưng:**

1. ✅ **Spring Boot phía** - Đã hoàn thành (gửi message lên SNS)
2. ❌ **AWS phía** - Chưa hoàn thành (Lambda + SES)

**Để hoàn thành, bạn cần:**
1. Tạo SNS Topic
2. Tạo Lambda Function (Python)
3. Verify email trong SES
4. Subscribe Lambda vào SNS Topic

Sau khi hoàn thành, quy trình sẽ hoạt động như sau:
- Người dùng đăng ký → Spring Boot gửi message lên SNS
- SNS nhận message → Gửi cho Lambda
- Lambda nhận message → Gửi email qua SES
- User nhận email xác nhận
