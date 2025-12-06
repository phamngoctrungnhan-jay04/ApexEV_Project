# 🎯 KẾ HOẠCH TRIỂN KHAI APEXEV LÊN AWS

**Account:** 029930584678  
**Region:** ap-southeast-1 (Singapore)  
**Free Tier:** Available

---

## 📊 TÓM TẮT 3 PHƯƠNG ÁN

| Tiêu chí | Phương án 1 (Minimal) | Phương án 2 (Standard) | Phương án 3 (Full) |
|----------|----------------------|------------------------|-------------------|
| **Chi phí/tháng** | ~$15 | ~$35 | ~$70 |
| **Thời gian setup** | 2-3 giờ | 4-5 giờ | 8-10 giờ |
| **Load Balancer** | ❌ | ✅ | ✅ |
| **Auto Scaling** | ❌ | ✅ | ✅ |
| **Caching (Redis)** | ❌ | ❌ | ✅ |
| **Private Network** | ❌ | ❌ | ✅ |
| **Production Ready** | ❌ | ⚠️ | ✅ |
| **Khuyến nghị cho** | Testing | Development | Production |

---

## 🚀 PHƯƠNG ÁN 1: MINIMAL (~$15/tháng)

### **Kiến trúc:**
```
Internet
   ↓
ECS Fargate (Public IP:8080)
   ↓
RDS MySQL (Private)
   ↓
S3 (Photos/Videos)
```

### **Resources:**
1. ECR Repository: `apexev`
2. RDS MySQL: `apexev-db` (db.t2.micro - FREE)
3. S3 Bucket: `apexev-media-029930584678` (FREE)
4. ECS Cluster: `apexev-cluster`
5. ECS Task Definition (0.25 vCPU, 0.5GB RAM)
6. ECS Service (1 task)
7. Security Groups

### **Chi tiết từng bước:**

#### **BƯỚC 1: Tạo ECR Repository (5 phút)**
```bash
aws ecr create-repository \
    --repository-name apexev \
    --region ap-southeast-1 \
    --image-scanning-configuration scanOnPush=true
```

#### **BƯỚC 2: Push Docker Image (10 phút)**
```bash
# Login
aws ecr get-login-password --region ap-southeast-1 | \
    docker login --username AWS --password-stdin \
    029930584678.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag
docker tag apexev:latest \
    029930584678.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest

# Push
docker push 029930584678.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest
```

#### **BƯỚC 3: Tạo RDS MySQL (20 phút)**
```bash
aws rds create-db-instance \
    --db-instance-identifier apexev-db \
    --db-instance-class db.t2.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password <STRONG_PASSWORD> \
    --allocated-storage 20 \
    --vpc-security-group-ids <SG_ID> \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --publicly-accessible false \
    --region ap-southeast-1
```

#### **BƯỚC 4: Tạo S3 Bucket (5 phút)**
```bash
aws s3 mb s3://apexev-media-029930584678 --region ap-southeast-1

# Configure CORS
aws s3api put-bucket-cors \
    --bucket apexev-media-029930584678 \
    --cors-configuration file://s3-cors.json
```

#### **BƯỚC 5: Tạo ECS Cluster (5 phút)**
```bash
aws ecs create-cluster \
    --cluster-name apexev-cluster \
    --region ap-southeast-1
```

#### **BƯỚC 6: Tạo Task Definition (15 phút)**
- Tạo file `task-definition.json`
- Register task definition
- Configure environment variables

#### **BƯỚC 7: Tạo ECS Service (10 phút)**
```bash
aws ecs create-service \
    --cluster apexev-cluster \
    --service-name apexev-service \
    --task-definition apexev-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "..." \
    --region ap-southeast-1
```

#### **BƯỚC 8: Test & Verify (30 phút)**
- Lấy Public IP của task
- Test health check: `http://<PUBLIC_IP>:8080/actuator/health`
- Test API endpoints

### **Tổng thời gian:** ~2-3 giờ

---

## 🚀 PHƯƠNG ÁN 2: STANDARD (~$35/tháng)

### **Kiến trúc:**
```
Internet
   ↓
Application Load Balancer
   ↓
ECS Fargate (Private)
   ↓
RDS MySQL (Private)
   ↓
S3 (Photos/Videos)
```

### **Resources bổ sung (so với Phương án 1):**
8. Application Load Balancer
9. Target Group
10. Listener (HTTP/HTTPS)
11. Security Groups (ALB, ECS, RDS)

### **Chi tiết từng bước:**

#### **BƯỚC 1-7:** Giống Phương án 1

#### **BƯỚC 8: Tạo Application Load Balancer (20 phút)**
```bash
# Tạo ALB
aws elbv2 create-load-balancer \
    --name apexev-alb \
    --subnets subnet-0de01378a5d08cf1c subnet-0d2abd056726afb0f \
    --security-groups <SG_ID> \
    --scheme internet-facing \
    --type application \
    --region ap-southeast-1

# Tạo Target Group
aws elbv2 create-target-group \
    --name apexev-tg \
    --protocol HTTP \
    --port 8080 \
    --vpc-id vpc-0135fca1db04c9138 \
    --target-type ip \
    --health-check-path /actuator/health \
    --region ap-southeast-1

# Tạo Listener
aws elbv2 create-listener \
    --load-balancer-arn <ALB_ARN> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=<TG_ARN>
```

#### **BƯỚC 9: Update ECS Service (10 phút)**
- Attach Target Group vào ECS Service
- Remove public IP assignment
- Update security groups

#### **BƯỚC 10: Test & Verify (20 phút)**
- Lấy ALB DNS name
- Test: `http://<ALB_DNS>/actuator/health`
- Test API endpoints

### **Tổng thời gian:** ~4-5 giờ

---

## 🚀 PHƯƠNG ÁN 3: FULL (~$70/tháng)

### **Kiến trúc:** (Theo sơ đồ của bạn)
```
Internet
   ↓
Route 53 (DNS)
   ↓
CloudFront (CDN)
   ↓
Application Load Balancer
   ↓
ECS Fargate (Private Subnet)
   ↓
RDS MySQL + ElastiCache Redis (Private Subnet)
   ↓
S3 (Photos/Videos)
   ↓
CloudWatch + SNS + Lambda (Monitoring)
```

### **Resources bổ sung (so với Phương án 2):**
11. VPC Custom
12. Private Subnets (2 AZs)
13. NAT Gateway
14. ElastiCache Redis
15. Route 53 Hosted Zone
16. CloudFront Distribution
17. ACM Certificate (SSL)
18. CloudWatch Alarms
19. SNS Topics
20. Lambda Functions

### **Chi tiết từng bước:**

#### **BƯỚC 1-10:** Giống Phương án 2 (nhưng dùng VPC custom)

#### **BƯỚC 11: Tạo VPC Custom (30 phút)**
- Tạo VPC: 10.0.0.0/16
- Tạo Public Subnets: 10.0.1.0/24, 10.0.2.0/24
- Tạo Private Subnets: 10.0.11.0/24, 10.0.12.0/24
- Tạo Internet Gateway
- Tạo NAT Gateway
- Configure Route Tables

#### **BƯỚC 12: Tạo ElastiCache Redis (20 phút)**
```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id apexev-redis \
    --cache-node-type cache.t2.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name <SUBNET_GROUP> \
    --security-group-ids <SG_ID> \
    --region ap-southeast-1
```

#### **BƯỚC 13: Setup Route 53 & Domain (30 phút)**
- Đăng ký domain (hoặc dùng có sẵn)
- Tạo Hosted Zone
- Request ACM Certificate
- Validate certificate

#### **BƯỚC 14: Setup CloudFront (30 phút)**
- Tạo CloudFront distribution
- Origin: ALB
- Configure caching
- Attach SSL certificate

#### **BƯỚC 15: Setup Monitoring (45 phút)**
- CloudWatch Log Groups
- CloudWatch Alarms
- SNS Topics
- Lambda Functions
- SES Email

#### **BƯỚC 16: Update Application Code (60 phút)**
- Add Redis caching
- Update environment variables
- Rebuild & redeploy

#### **BƯỚC 17: Test & Verify (60 phút)**
- Test domain: `https://api.apexev.com`
- Test caching
- Test monitoring
- Load testing

### **Tổng thời gian:** ~8-10 giờ

---

## 📝 FILES CẦN TẠO

Tôi sẽ tạo các files sau để hỗ trợ deployment:

1. `task-definition.json` - ECS Task Definition
2. `s3-cors.json` - S3 CORS configuration
3. `security-groups.sh` - Script tạo Security Groups
4. `deploy.sh` - Script deploy tự động
5. `terraform/` - Infrastructure as Code (nếu dùng Terraform)

---

## ❓ BẠN CHỌN PHƯƠNG ÁN NÀO?

Hãy cho tôi biết:
- **A** - Phương án 1 (Minimal - $15/tháng)
- **B** - Phương án 2 (Standard - $35/tháng)
- **C** - Phương án 3 (Full - $70/tháng)

Sau khi bạn chọn, tôi sẽ:
1. Tạo tất cả files cần thiết
2. Hướng dẫn từng bước chi tiết
3. Chạy các lệnh để deploy

**Khuyến nghị:** Bắt đầu với **Phương án 1** hoặc **2** để test, sau đó nâng cấp lên **3** khi cần production.
