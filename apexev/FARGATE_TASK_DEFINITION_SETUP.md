# Hướng Dẫn Tạo Fargate Task Definition với IAM Role

## 📋 Yêu Cầu
- Docker image đã được push lên ECR
- IAM Role đã được tạo (xem `FARGATE_AWS_CREDENTIALS_SETUP.md`)

---

## Cách 1: Tạo qua AWS Console (Dễ nhất)

### Bước 1: Vào ECS
1. Vào [ECS Console](https://console.aws.amazon.com/ecs/)
2. Chọn region: **Asia Pacific (Singapore)**
3. Vào **Task Definitions** → **Create new task definition**

### Bước 2: Điền Thông Tin Cơ Bản
- **Task definition family:** `apexev-task`
- **Launch type:** FARGATE
- **Operating system/Architecture:** Linux/x86_64
- **Network mode:** awsvpc
- **CPU:** 512 (0.5 vCPU)
- **Memory:** 1024 (1 GB)

### Bước 3: Cấu Hình Task Role
- **Task role:** Chọn role vừa tạo (ví dụ: `apexev-fargate-task-role`)
- **Task execution role:** Chọn `ecsTaskExecutionRole` (hoặc tạo mới)

### Bước 4: Thêm Container
Click **Add container**

Điền:
- **Name:** `apexev-app`
- **Image URI:** `123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest`
- **Port mappings:** 
  - Container port: 8080
  - Protocol: tcp

### Bước 5: Cấu Hình Environment Variables
Click **Environment variables** → **Add**

Thêm:
```
AWS_REGION = ap-southeast-1
AWS_SNS_EMAIL_TOPIC_ARN = arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events
DB_URL = jdbc:mysql://your-rds-endpoint:3306/apexev?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME = admin
DB_PASSWORD = your_password
JWT_SECRET = HanhTrinhLenMayCungFCJ123456789012
```

### Bước 6: Cấu Hình Logging
- **Log driver:** awslogs
- **Log group:** `/ecs/apexev-service`
- **Log stream prefix:** `apexev`
- **Region:** ap-southeast-1

### Bước 7: Tạo Task Definition
Click **Create**

---

## Cách 2: Tạo qua AWS CLI

### Bước 1: Tạo JSON File

Tạo file `task-definition.json`:

```json
{
  "family": "apexev-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "taskRoleArn": "arn:aws:iam::123456789012:role/apexev-fargate-task-role",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "apexev-app",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "AWS_REGION",
          "value": "ap-southeast-1"
        },
        {
          "name": "AWS_SNS_EMAIL_TOPIC_ARN",
          "value": "arn:aws:sns:ap-southeast-1:123456789012:apexev-email-events"
        },
        {
          "name": "DB_URL",
          "value": "jdbc:mysql://your-rds-endpoint:3306/apexev?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
        },
        {
          "name": "DB_USERNAME",
          "value": "admin"
        },
        {
          "name": "DB_PASSWORD",
          "value": "your_password"
        },
        {
          "name": "JWT_SECRET",
          "value": "HanhTrinhLenMayCungFCJ123456789012"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/apexev-service",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "apexev"
        }
      }
    }
  ]
}
```

### Bước 2: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-southeast-1
```

---

## Bước 3: Tạo ECS Service

### Qua AWS Console:
1. Vào **Clusters** → Chọn cluster
2. Click **Create** → **Service**
3. Điền:
   - **Launch type:** FARGATE
   - **Task definition:** apexev-task
   - **Service name:** apexev-service
   - **Desired count:** 1
4. **Networking:**
   - **VPC:** Chọn VPC
   - **Subnets:** Chọn subnets
   - **Security groups:** Tạo hoặc chọn (mở port 8080)
5. **Load balancing:** (Optional) Chọn ALB nếu có
6. Click **Create service**

### Qua AWS CLI:

```bash
aws ecs create-service \
  --cluster apexev-cluster \
  --service-name apexev-service \
  --task-definition apexev-task:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --region ap-southeast-1
```

---

## Bước 4: Kiểm Tra Service

### Xem Task Status
```bash
aws ecs list-tasks \
  --cluster apexev-cluster \
  --region ap-southeast-1
```

### Xem Task Details
```bash
aws ecs describe-tasks \
  --cluster apexev-cluster \
  --tasks arn:aws:ecs:ap-southeast-1:123456789012:task/apexev-cluster/abc123 \
  --region ap-southeast-1
```

### Xem Logs
```bash
aws logs tail /ecs/apexev-service --follow --region ap-southeast-1
```

---

## Bước 5: Update Service (Khi có version mới)

### Cách 1: Force New Deployment
```bash
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --force-new-deployment \
  --region ap-southeast-1
```

### Cách 2: Update Task Definition
```bash
# Register new task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-southeast-1

# Update service
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --task-definition apexev-task:2 \
  --region ap-southeast-1
```

---

## 🔍 Troubleshooting

### Task không start
**Kiểm tra:**
1. CloudWatch logs: `/ecs/apexev-service`
2. Task status: `PROVISIONING`, `PENDING`, `ACTIVATING`, `RUNNING`
3. Stop reason nếu có

### Lỗi "The security token included in the request is invalid"
**Nguyên nhân:** Task role không được attach
**Cách fix:**
1. Kiểm tra task definition có task role không
2. Kiểm tra role có quyền SNS không
3. Update task definition

### Lỗi "Cannot pull image"
**Nguyên nhân:** ECR image không tồn tại hoặc permission sai
**Cách fix:**
1. Kiểm tra image URI đúng không
2. Kiểm tra task execution role có quyền ECR không

### Application không respond
**Kiểm tra:**
1. Security group có mở port 8080 không
2. Application logs có error không
3. Database connection có đúng không

---

## 📋 Checklist

- [ ] Docker image đã push lên ECR
- [ ] IAM Role đã tạo với SNS + SES permissions
- [ ] Task definition đã tạo
- [ ] Task role được attach vào task definition
- [ ] Environment variables đã set đúng
- [ ] ECS Service đã tạo
- [ ] Task đang chạy (status: RUNNING)
- [ ] Logs không có error
- [ ] Test đăng ký thành công

---

## 🎯 Quy Trình Deploy

```
1. Build Docker image
   ↓
2. Push lên ECR
   ↓
3. Tạo/Update Task Definition
   ↓
4. Tạo/Update ECS Service
   ↓
5. Fargate tự động pull image và start task
   ↓
6. Application chạy trên Fargate
   ↓
7. Credentials tự động inject từ IAM Role
   ↓
8. SNS message được gửi thành công
```

---

## 📚 Tham Khảo

- [ECS Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)
- [Fargate Launch Type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html)
- [IAM Roles for ECS Tasks](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [ECS Services](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html)
