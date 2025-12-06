# 🚀 HƯỚNG DẪN HOÀN CHỈNH - DEPLOY APEXEV LÊN AWS

**Phương án:** Standard (~$35/tháng)  
**Thời gian:** 4-5 giờ  
**Độ khó:** Trung bình

---

## 📋 DANH SÁCH SCRIPTS

| Script | Mục đích | Thời gian | Output File |
|--------|----------|-----------|-------------|
| `01-ecr-setup.sh` | Push Docker image lên ECR | 15 phút | - |
| `02-rds-setup.sh` | Tạo RDS MySQL database | 30 phút | `rds-info.txt` |
| `03-s3-setup.sh` | Tạo S3 bucket | 10 phút | `s3-info.txt` |
| `04-ecs-setup.sh` | Setup ECS Cluster & Task | 15 phút | `ecs-info.txt` |
| `05-alb-setup.sh` | Setup Load Balancer | 10 phút | `alb-info.txt` |
| `06-deploy.sh` | Deploy service lên ECS | 5 phút | `deployment-info.txt` |
| `07-verify.sh` | Test & verify | 5 phút | - |
| `update-app.sh` | Update code mới | 10 phút | - |

**Tổng thời gian:** ~90 phút (1.5 giờ)

---

## 🎯 CHẠY TẤT CẢ SCRIPTS

### **Cách 1: Chạy từng script (Khuyến nghị)**
```bash
cd aws-deployment

# Bước 1-3: Infrastructure
bash 01-ecr-setup.sh
bash 02-rds-setup.sh  # Nhớ đổi password trước!
bash 03-s3-setup.sh

# Bước 4-6: Deployment
bash 04-ecs-setup.sh
bash 05-alb-setup.sh
bash 06-deploy.sh

# Bước 7: Verify
bash 07-verify.sh
```

### **Cách 2: Chạy tất cả cùng lúc (Nâng cao)**
```bash
cd aws-deployment
bash 01-ecr-setup.sh && \
bash 02-rds-setup.sh && \
bash 03-s3-setup.sh && \
bash 04-ecs-setup.sh && \
bash 05-alb-setup.sh && \
bash 06-deploy.sh && \
bash 07-verify.sh
```

---

## 📝 SAU KHI DEPLOY XONG

### **Bạn sẽ có:**
1. ✅ Docker image trên ECR
2. ✅ RDS MySQL database
3. ✅ S3 bucket
4. ✅ ECS Cluster với 1 task đang chạy
5. ✅ Application Load Balancer
6. ✅ App accessible qua HTTP

### **URLs:**
- **Health Check:** `http://<ALB_DNS>/actuator/health`
- **API Base:** `http://<ALB_DNS>/api`
- **Swagger:** `http://<ALB_DNS>/swagger-ui.html`

---

## 🔄 UPDATE CODE MỚI

Sau khi đã deploy xong, khi có code mới:

```bash
cd aws-deployment
bash update-app.sh
```

Script này sẽ:
1. Build Docker image mới
2. Push lên ECR
3. Update ECS service
4. Chờ deployment hoàn tất

**Thời gian:** 5-10 phút

---

## 💰 CHI PHÍ

### **Free Tier (12 tháng đầu):**
- RDS db.t2.micro: FREE
- S3 (5GB): FREE
- Data Transfer (15GB): FREE

### **Phải trả:**
- ECS Fargate (0.25 vCPU, 0.5GB): ~$15/tháng
- ALB: ~$20/tháng

**Tổng: ~$35/tháng**

---

## 🆘 TROUBLESHOOTING

### **Script bị lỗi:**
```bash
# Xem lỗi chi tiết
bash -x <script-name>.sh
```

### **Task không start:**
```bash
# Xem logs
aws logs tail /ecs/apexev --follow --region ap-southeast-1
```

### **Target không healthy:**
```bash
# Kiểm tra security groups
# Kiểm tra health check path
# Đợi thêm 2-3 phút
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Copy error message
2. Cho tôi biết đang ở script nào
3. Nội dung các file *-info.txt

---

**🎉 CHÚC BẠN DEPLOY THÀNH CÔNG!**
