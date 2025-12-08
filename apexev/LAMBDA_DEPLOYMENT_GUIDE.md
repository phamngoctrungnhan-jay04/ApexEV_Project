# Hướng Dẫn Deploy Lambda Function

## 📋 Yêu Cầu
- AWS Account
- AWS CLI (hoặc dùng AWS Console)
- Python 3.11

---

## Cách 1: Deploy qua AWS Console (Dễ nhất)

### Bước 1: Tạo Lambda Function
1. Vào AWS Console → **Lambda** → **Create function**
2. Điền thông tin:
   - **Function name:** `apexev-email-handler`
   - **Runtime:** Python 3.11
   - **Architecture:** x86_64
   - **Execution role:** Tạo role mới với quyền SES

### Bước 2: Cấu hình IAM Role
1. Vào **IAM** → **Roles** → Tìm role vừa tạo
2. Click **Add permissions** → **Attach policies**
3. Tìm và chọn: `AmazonSESFullAccess`

### Bước 3: Paste Code
1. Vào Lambda function vừa tạo
2. Xóa code mặc định
3. Copy toàn bộ code từ file `lambda_email_handler.py`
4. Paste vào **Code source**
5. Click **Deploy**

### Bước 4: Tăng Timeout
1. Vào **Configuration** → **General configuration**
2. Thay đổi **Timeout** thành 30 giây
3. Click **Save**

---

## Cách 2: Deploy qua AWS CLI

### Bước 1: Tạo IAM Role
```bash
aws iam create-role \
  --role-name apexev-lambda-role \
  --assume-role-policy-document '{
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
  }'
```

### Bước 2: Attach SES Policy
```bash
aws iam attach-role-policy \
  --role-name apexev-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
```

### Bước 3: Tạo ZIP File
```bash
zip lambda_function.zip lambda_email_handler.py
```

### Bước 4: Deploy Lambda
```bash
aws lambda create-function \
  --function-name apexev-email-handler \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/apexev-lambda-role \
  --handler lambda_email_handler.lambda_handler \
  --zip-file fileb://lambda_function.zip \
  --timeout 30 \
  --region ap-southeast-1
```

### Bước 5: Update Lambda (nếu cần sửa)
```bash
zip lambda_function.zip lambda_email_handler.py

aws lambda update-function-code \
  --function-name apexev-email-handler \
  --zip-file fileb://lambda_function.zip \
  --region ap-southeast-1
```

---

## Bước 5: Tạo SNS Topic

### Qua AWS Console:
1. Vào **SNS** → **Topics** → **Create topic**
2. Tên: `apexev-email-events`
3. Type: **Standard**
4. Click **Create topic**
5. **Lưu lại Topic ARN** (ví dụ: `arn:aws:sns:ap-southeast-1:123456789:apexev-email-events`)

### Qua AWS CLI:
```bash
aws sns create-topic \
  --name apexev-email-events \
  --region ap-southeast-1
```

---

## Bước 6: Subscribe Lambda vào SNS Topic

### Qua AWS Console:
1. Vào SNS Topic vừa tạo
2. Click **Create subscription**
3. **Protocol:** AWS Lambda
4. **Endpoint:** Chọn `apexev-email-handler`
5. Click **Create subscription**

### Qua AWS CLI:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-1:123456789:apexev-email-events \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:ap-southeast-1:123456789:function:apexev-email-handler \
  --region ap-southeast-1
```

---

## Bước 7: Cấp quyền cho SNS gọi Lambda

### Qua AWS CLI:
```bash
aws lambda add-permission \
  --function-name apexev-email-handler \
  --statement-id AllowSNSInvoke \
  --action lambda:InvokeFunction \
  --principal sns.amazonaws.com \
  --source-arn arn:aws:sns:ap-southeast-1:123456789:apexev-email-events \
  --region ap-southeast-1
```

---

## Bước 8: Cập nhật .env

```properties
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789:apexev-email-events
```

---

## Bước 9: Test Lambda

### Test qua AWS Console:
1. Vào Lambda function
2. Click **Test**
3. Tạo test event:

```json
{
  "Records": [
    {
      "Sns": {
        "Message": "{\"type\": \"REGISTRATION_CONFIRMATION\", \"email\": \"test@example.com\", \"fullName\": \"Nguyen Van A\", \"confirmationLink\": \"https://apexev.com/verify?token=abc123\"}"
      }
    }
  ]
}
```

4. Click **Test**
5. Kiểm tra kết quả

### Test qua Spring Boot:
1. Chạy ứng dụng
2. Gọi API đăng ký:
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

3. Kiểm tra CloudWatch Logs của Lambda
4. Kiểm tra email nhận được

---

## Troubleshooting

### Lambda không nhận được message từ SNS
- Kiểm tra SNS subscription có đúng không
- Kiểm tra Lambda permission có cho phép SNS invoke không
- Xem CloudWatch Logs

### Email không được gửi
- Kiểm tra SES email có verified không
- Kiểm tra IAM role có quyền SES không
- Xem CloudWatch Logs của Lambda

### Lỗi "MessageRejected"
- Email source phải là verified email trong SES
- Kiểm tra email address format

### Timeout
- Tăng Lambda timeout lên 30 giây
- Kiểm tra network connectivity

---

## Monitoring

### Xem CloudWatch Logs:
```bash
aws logs tail /aws/lambda/apexev-email-handler --follow
```

### Xem Lambda Metrics:
1. Vào Lambda function
2. Click **Monitor**
3. Xem Invocations, Errors, Duration

---

## Cleanup (Nếu cần xóa)

```bash
# Xóa Lambda function
aws lambda delete-function \
  --function-name apexev-email-handler \
  --region ap-southeast-1

# Xóa SNS Topic
aws sns delete-topic \
  --topic-arn arn:aws:sns:ap-southeast-1:123456789:apexev-email-events \
  --region ap-southeast-1

# Xóa IAM Role
aws iam detach-role-policy \
  --role-name apexev-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

aws iam delete-role \
  --role-name apexev-lambda-role
```

---

## Tham Khảo

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Python boto3 SES](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ses.html)
