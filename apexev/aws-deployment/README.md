# 🚀 HƯỚNG DẪN DEPLOY APEXEV LÊN AWS

**Phương án:** Standard (~$35/tháng)  
**Account:** 029930584678  
**Region:** ap-southeast-1 (Singapore)

---

## 📋 TỔNG QUAN

Deployment gồm 7 bước chính:

1. ✅ **ECR Setup** - Push Docker image
2. ✅ **RDS Setup** - Tạo MySQL database
3. ✅ **S3 Setup** - Tạo bucket lưu ảnh/video
4. ⏳ **ECS Setup** - Tạo cluster & task definition
5. ⏳ **ALB Setup** - Tạo load balancer
6. ⏳ **Deploy** - Deploy service lên ECS
7. ⏳ **Verify** - Test & verify

**Thời gian ước tính:** 4-5 giờ

---

## ⚙️ YÊU CẦU

- [x] Docker Desktop đang chạy
- [x] AWS CLI đã cài đặt
- [x] AWS credentials đã cấu hình
- [x] Docker image `apexev:latest` đã build

---

## 🎯 BƯỚC 1: ECR SETUP (15 phút)

### **Chạy script:**
```bash
cd aws-deployment
bash 01-ecr-setup.sh
```

### **Script sẽ làm:**
1. Tạo ECR repository `apexev`
2. Login vào ECR
3. Tag Docker image
4. Push image lên ECR
5. Verify image

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 1: ECR SETUP
📝 Image URI: 029930584678.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest
```

---

## 🎯 BƯỚC 2: RDS SETUP (20-30 phút)

### **⚠️ QUAN TRỌNG: Đổi password trước!**

Mở file `02-rds-setup.sh` và đổi dòng:
```bash
DB_PASSWORD="ApexEV2024SecurePassword!"  # ⚠️ THAY ĐỔI PASSWORD NÀY!
```

Thành password mạnh của bạn (ít nhất 12 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt).

### **Chạy script:**
```bash
bash 02-rds-setup.sh
```

### **Script sẽ làm:**
1. Tạo Security Group cho RDS
2. Tạo DB Subnet Group
3. Tạo RDS MySQL instance (db.t2.micro - FREE TIER)
4. Chờ RDS khởi động (10-15 phút)
5. Lấy RDS endpoint

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 2: RDS SETUP
📝 RDS Endpoint: apexev-db.xxxxx.ap-southeast-1.rds.amazonaws.com
💾 Thông tin đã lưu vào: rds-info.txt
```

### **Kiểm tra file `rds-info.txt`:**
```bash
cat rds-info.txt
```

---

## 🎯 BƯỚC 3: S3 SETUP (10 phút)

### **Chạy script:**
```bash
bash 03-s3-setup.sh
```

### **Script sẽ làm:**
1. Tạo S3 bucket `apexev-media-029930584678`
2. Cấu hình CORS
3. Cấu hình Lifecycle policy
4. Block public access (bảo mật)
5. Tạo IAM policy cho S3
6. Test upload/download

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 3: S3 SETUP
📝 Bucket: apexev-media-029930584678
💾 Thông tin đã lưu vào: s3-info.txt
```

---

## 🎯 BƯỚC 3B: VPC ENDPOINTS SETUP (10 phút) - OPTIONAL

### **⚠️ Chọn 1 trong 2 phương án:**

#### **Phương án A: NAT Gateway (Đơn giản hơn)**
- Chi phí: ~$32/tháng
- Dễ setup
- Phù hợp cho: Development/Testing

#### **Phương án B: VPC Endpoints (Tiết kiệm chi phí)** ⭐
- Chi phí: ~$7/tháng (rẻ hơn $25/tháng)
- Phức tạp hơn
- Phù hợp cho: Production

### **Nếu chọn VPC Endpoints, chạy script:**
```bash
bash 03b-vpc-endpoints-setup.sh
```

### **Script sẽ làm:**
1. Tạo Security Group cho VPC Endpoints
2. Tạo ECR API Endpoint (để pull image metadata)
3. Tạo ECR DKR Endpoint (để pull Docker layers)
4. Tạo S3 Gateway Endpoint (FREE!)
5. Tạo CloudWatch Logs Endpoint (để ghi logs)
6. Tạo Secrets Manager Endpoint (optional)

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 3B: VPC ENDPOINTS SETUP
💰 Chi phí: ~$7/tháng (tiết kiệm $25 so với NAT Gateway)
💾 Thông tin đã lưu vào: vpc-endpoints-info.txt
```

### **💡 So sánh chi phí:**
```
NAT Gateway:
  - $0.045/giờ × 730 giờ = $32.85/tháng
  - Data transfer: $0.045/GB
  - Tổng: ~$35-40/tháng

VPC Endpoints:
  - Interface Endpoints: $0.01/giờ × 4 endpoints × 730 giờ = $29.20/tháng
  - Data transfer: $0.01/GB (rẻ hơn NAT)
  - S3 Gateway: FREE
  - Tổng: ~$7-10/tháng (nếu traffic thấp)
```

### **🎯 Khuyến nghị:**
- **Development:** Không cần NAT Gateway hay VPC Endpoints (dùng Public Subnet)
- **Production nhỏ:** VPC Endpoints (tiết kiệm chi phí)
- **Production lớn:** NAT Gateway (đơn giản hơn)

---

## 🎯 BƯỚC 4: ECS SETUP (15 phút)

### **Chạy script:**
```bash
bash 04-ecs-setup.sh
```

### **Script sẽ làm:**
1. Tạo ECS Cluster
2. Tạo IAM Roles (Execution Role + Task Role)
3. Tạo CloudWatch Log Group
4. Tạo Task Definition với environment variables
5. Lưu thông tin vào `ecs-info.txt`

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 4: ECS SETUP
💾 Thông tin đã lưu vào: ecs-info.txt
```

---

## 🎯 BƯỚC 5: ALB SETUP (10 phút)

### **Chạy script:**
```bash
bash 05-alb-setup.sh
```

### **Script sẽ làm:**
1. Tạo Security Groups (ALB + ECS)
2. Cập nhật RDS Security Group
3. Tạo Application Load Balancer
4. Tạo Target Group
5. Tạo Listener (HTTP:80)
6. Lưu thông tin vào `alb-info.txt`

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 5: ALB SETUP
📝 ALB DNS: apexev-alb-xxxxx.ap-southeast-1.elb.amazonaws.com
💾 Thông tin đã lưu vào: alb-info.txt
```

---

## 🎯 BƯỚC 6: DEPLOY (5 phút)

### **Chạy script:**
```bash
bash 06-deploy.sh
```

### **Script sẽ làm:**
1. Tạo ECS Service
2. Deploy container lên Fargate
3. Attach vào Target Group
4. Chờ service stable
5. Kiểm tra target health
6. Lưu thông tin vào `deployment-info.txt`

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH BƯỚC 6: DEPLOY
📝 URL: http://apexev-alb-xxxxx.ap-southeast-1.elb.amazonaws.com
💾 Thông tin đã lưu vào: deployment-info.txt
```

---

## 🎯 BƯỚC 7: VERIFY (5 phút)

### **Chạy script:**
```bash
bash 07-verify.sh
```

### **Script sẽ làm:**
1. Kiểm tra ECS Service status
2. Kiểm tra Target health
3. Test health check endpoint
4. Test API endpoint
5. Xem CloudWatch logs

### **Kết quả mong đợi:**
```
✅ HOÀN THÀNH VERIFICATION
✅ Health check thành công! (HTTP 200)
✅ API endpoint hoạt động! (HTTP 401)
```

---

## 📝 THÔNG TIN QUAN TRỌNG

### **Sau khi chạy xong 3 bước đầu, bạn sẽ có:**

1. **ECR Image:**
   ```
   029930584678.dkr.ecr.ap-southeast-1.amazonaws.com/apexev:latest
   ```

2. **RDS Endpoint:** (xem trong `rds-info.txt`)
   ```
   apexev-db.xxxxx.ap-southeast-1.rds.amazonaws.com:3306
   ```

3. **S3 Bucket:**
   ```
   apexev-media-029930584678
   ```

---

## ⏸️ TẠM DỪNG Ở ĐÂY

**Hãy chạy 3 scripts đầu tiên:**
```bash
cd aws-deployment
bash 01-ecr-setup.sh
bash 02-rds-setup.sh
bash 03-s3-setup.sh
```

**Sau khi chạy xong, cho tôi biết:**
1. Có lỗi gì không?
2. Nội dung file `rds-info.txt` và `s3-info.txt`
3. Sẵn sàng tiếp tục bước 4-7 chưa?

**Tôi sẽ tạo các scripts còn lại dựa trên thông tin từ 3 bước đầu!**

---

## 🆘 TROUBLESHOOTING

### **Lỗi: "Unable to locate credentials"**
```bash
aws configure
# Nhập Access Key ID và Secret Access Key
```

### **Lỗi: "Docker daemon not running"**
```bash
# Mở Docker Desktop và đợi khởi động
```

### **Lỗi: "Image not found"**
```bash
# Build lại Docker image
docker build -t apexev:latest .
```

### **Lỗi: "Repository already exists"**
```bash
# Bỏ qua lỗi này, script sẽ dùng repository có sẵn
```

---

## 💰 CHI PHÍ ƯỚC TÍNH

**Sau 3 bước đầu:**
- ECR: FREE (500MB/tháng)
- RDS db.t2.micro: FREE (Free Tier)
- S3: FREE (5GB/tháng)
- **Tổng: $0/tháng** (trong Free Tier)

**Sau khi deploy ECS + ALB:**
- ECS Fargate: ~$15/tháng
- ALB: ~$20/tháng
- **Tổng: ~$35/tháng**

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. Copy error message
2. Cho tôi biết đang ở bước nào
3. Tôi sẽ hỗ trợ debug

---

**🚀 BẮT ĐẦU NGAY BÂY GIỜ!**

```bash
cd aws-deployment
bash 01-ecr-setup.sh
```
