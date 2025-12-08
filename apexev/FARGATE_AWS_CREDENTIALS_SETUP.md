# Hướng Dẫn Cấu Hình AWS Credentials cho Fargate

## 🎯 Vấn đề
Khi deploy Spring Boot lên Fargate, không nên hardcode AWS credentials vào `.env` vì:
1. **Bảo mật:** Credentials sẽ bị expose trong Docker image
2. **Quản lý:** Khó thay đổi credentials mà không rebuild image
3. **Best practice:** AWS khuyến cáo dùng IAM Role

## ✅ Giải Pháp: Dùng IAM Role cho Fargate Task

---

## Bước 1: Tạo IAM Role cho Fargate Task

### 1.1 Tạo Trust Policy
Vào [IAM Console](https://console.aws.amazon.com/iam/) → **Roles** → **Create role**

Chọn:
- **Trusted entity type:** AWS service
- **Service:** Elastic Container Service
- **Use case:** Elastic Container Service Task

Click **Next**

### 1.2 Attach Policies
Tìm và chọn:
- `AmazonSNSFullAccess`
- `AmazonSESFullAccess`

Click **Next** → **Create role**

**Lưu lại Role ARN** (ví dụ: `arn:aws:iam::123456789012:role/apexev-fargate-task-role`)

---

## Bước 2: Cập nhật Dockerfile

Xóa AWS credentials khỏi Dockerfile:

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/apexev-0.0.1-SNAPSHOT.jar app.jar

# Không cần set AWS credentials ở đây
# AWS sẽ tự động inject credentials qua IAM Role

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Bước 3: Cập nhật application.properties

Thay đổi cách lấy AWS credentials:

```properties
# ==========================================
# AWS CONFIGURATION
# ==========================================
# Không cần set access-key-id và secret-access-key
# Fargate sẽ tự động inject qua IAM Role

# Chỉ cần set region
aws.sns.region=${AWS_REGION:ap-southeast-1}
aws.sns.email-topic-arn=${AWS_SNS_EMAIL_TOPIC_ARN}

# ==========================================
```

---

## Bước 4: Cập nhật SNSConfig.java

Sửa SNSConfig để sử dụng **DefaultAWSCredentialsProviderChain** (tự động lấy credentials từ IAM Role):

```java
package com.apexev.config;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SNSConfig {

    @Value("${aws.sns.region:ap-southeast-1}")
    private String region;

    @Bean
    public AmazonSNS amazonSNS() {
        return AmazonSNSClientBuilder
                .standard()
                .withRegion(region)
                .withCredentials(new DefaultAWSCredentialsProviderChain())
                .build();
    }
}
```

**Giải thích:**
- `DefaultAWSCredentialsProviderChain` sẽ tự động tìm credentials theo thứ tự:
  1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  2. System properties
  3. **IAM Role (khi chạy trên Fargate/EC2)** ← Cái này sẽ được dùng
  4. Credentials file

---

## Bước 5: Cập nhật .env (Local Development)

Khi chạy local, vẫn cần credentials:

```properties
# ==========================================
# AWS CONFIGURATION (Local Development)
# ==========================================
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events
```

---

## Bước 6: Cập nhật Fargate Task Definition

Khi tạo Fargate task, cấu hình:

### 6.1 Task Role
- **Task role:** Chọn role vừa tạo (`apexev-fargate-task-role`)

### 6.2 Environment Variables
Thêm:
```
AWS_REGION=ap-southeast-1
AWS_SNS_EMAIL_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events
```

**Không cần thêm:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Fargate sẽ tự động inject credentials từ IAM Role.

---

## Bước 7: Deploy lên Fargate

### 7.1 Build Docker Image
```bash
mvn clean package -DskipTests
docker build -t apexev:latest .
```

### 7.2 Push lên ECR
```bash
# Login ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag image
docker tag apexev:latest 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest

# Push
docker push 123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest
```

### 7.3 Update Fargate Service
```bash
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --force-new-deployment \
  --region ap-southeast-1
```

---

## Bước 8: Kiểm Tra

### 8.1 Kiểm tra Fargate Task Logs
```bash
aws logs tail /ecs/apexev-service --follow --region ap-southeast-1
```

Tìm dòng:
```
Email event published to SNS: messageId=...
```

### 8.2 Test Đăng Ký
```bash
curl -X POST https://your-fargate-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyen Van A",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "password123"
  }'
```

### 8.3 Kiểm tra Lambda Logs
```bash
aws logs tail /aws/lambda/apexev-email-handler --follow --region ap-southeast-1
```

---

## 📋 Checklist

- [ ] Tạo IAM Role cho Fargate Task
- [ ] Attach SNS + SES policies vào role
- [ ] Cập nhật SNSConfig.java dùng `DefaultAWSCredentialsProviderChain`
- [ ] Xóa AWS credentials khỏi Dockerfile
- [ ] Cập nhật application.properties
- [ ] Build Docker image mới
- [ ] Push lên ECR
- [ ] Cập nhật Fargate Task Definition với Task Role
- [ ] Deploy lên Fargate
- [ ] Kiểm tra logs

---

## 🔍 Troubleshooting

### Lỗi: "The security token included in the request is invalid"
**Nguyên nhân:** IAM Role không được attach vào Fargate Task
**Cách fix:** 
1. Vào ECS Task Definition
2. Kiểm tra **Task role** có được set không
3. Nếu không, update task definition

### Lỗi: "User is not authorized to perform: sns:Publish"
**Nguyên nhân:** IAM Role không có quyền SNS
**Cách fix:**
1. Vào IAM Role
2. Attach `AmazonSNSFullAccess` policy

### Fargate Task không start
**Nguyên nhân:** Docker image có vấn đề
**Cách fix:**
1. Kiểm tra CloudWatch logs
2. Rebuild image
3. Push lên ECR
4. Update service

---

## 🎯 So Sánh: Local vs Fargate

| | Local | Fargate |
|---|---|---|
| **Credentials** | `.env` file | IAM Role |
| **SNSConfig** | BasicAWSCredentials | DefaultAWSCredentialsProviderChain |
| **Dockerfile** | Không cần (chạy mvn) | Cần (Docker image) |
| **Bảo mật** | Thấp (credentials hardcode) | Cao (IAM Role) |
| **Quản lý** | Khó (phải sửa .env) | Dễ (chỉ cần update role) |

---

## 📚 Tham Khảo

- [AWS IAM Roles for ECS Tasks](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [AWS SDK for Java - Credentials](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials.html)
- [DefaultAWSCredentialsProviderChain](https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/DefaultAWSCredentialsProviderChain.html)
- [Fargate Task Definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)

---

## 🔐 Best Practices

1. **Không hardcode credentials** vào code hoặc Docker image
2. **Dùng IAM Role** cho Fargate tasks
3. **Rotate credentials** định kỳ
4. **Giới hạn permissions** (principle of least privilege)
5. **Dùng CloudWatch** để monitor logs
6. **Dùng Secrets Manager** cho sensitive data (nếu cần)
