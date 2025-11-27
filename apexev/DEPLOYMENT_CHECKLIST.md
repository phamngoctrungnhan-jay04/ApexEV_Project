# ✅ DEPLOYMENT CHECKLIST

## 📋 TRƯỚC KHI BẮT ĐẦU

- [ ] Docker Desktop đang chạy
- [ ] AWS CLI đã cài đặt và cấu hình
- [ ] Docker image `apexev:latest` đã build
- [ ] Đã đọc `aws-deployment/README.md`

## 🚀 DEPLOYMENT STEPS

### **BƯỚC 1: ECR (15 phút)**
- [ ] Chạy `bash 01-ecr-setup.sh`
- [ ] Thấy message: ✅ HOÀN THÀNH BƯỚC 1
- [ ] Image đã được push lên ECR

### **BƯỚC 2: RDS (30 phút)**
- [ ] Đã đổi password trong `02-rds-setup.sh`
- [ ] Chạy `bash 02-rds-setup.sh`
- [ ] Đợi RDS khởi động (10-15 phút)
- [ ] File `rds-info.txt` đã được tạo
- [ ] Lưu lại RDS endpoint

### **BƯỚC 3: S3 (10 phút)**
- [ ] Chạy `bash 03-s3-setup.sh`
- [ ] File `s3-info.txt` đã được tạo
- [ ] Test upload/download thành công

### **BƯỚC 4: ECS (15 phút)**
- [ ] Chạy `bash 04-ecs-setup.sh`
- [ ] File `ecs-info.txt` đã được tạo
- [ ] Task Definition đã được register

### **BƯỚC 5: ALB (10 phút)**
- [ ] Chạy `bash 05-alb-setup.sh`
- [ ] File `alb-info.txt` đã được tạo
- [ ] Lưu lại ALB DNS name

### **BƯỚC 6: DEPLOY (5 phút)**
- [ ] Chạy `bash 06-deploy.sh`
- [ ] ECS Service đã stable
- [ ] File `deployment-info.txt` đã được tạo

### **BƯỚC 7: VERIFY (5 phút)**
- [ ] Chạy `bash 07-verify.sh`
- [ ] Health check trả về HTTP 200
- [ ] API endpoint trả về HTTP 401
- [ ] Logs hiển thị trên CloudWatch

## ✅ SAU KHI DEPLOY

- [ ] Lưu lại ALB URL
- [ ] Test các API endpoints
- [ ] Kiểm tra database connection
- [ ] Monitor CloudWatch logs
- [ ] Bookmark AWS Console links

## 📝 FILES QUAN TRỌNG

- [ ] `rds-info.txt` - RDS endpoint & credentials
- [ ] `s3-info.txt` - S3 bucket name
- [ ] `ecs-info.txt` - ECS cluster & task info
- [ ] `alb-info.txt` - ALB DNS & ARNs
- [ ] `deployment-info.txt` - URLs & endpoints

## 🔄 UPDATE CODE MỚI

- [ ] Build Docker image mới
- [ ] Chạy `bash update-app.sh`
- [ ] Verify deployment

## 💰 CHI PHÍ

- [ ] Đã hiểu chi phí: ~$35/tháng
- [ ] Setup billing alerts trên AWS
- [ ] Monitor chi phí hàng tuần

## 🎉 HOÀN THÀNH!

Khi tất cả checkbox đã được check:
- App đang chạy trên AWS
- Có thể truy cập qua ALB URL
- Sẵn sàng develop thêm features
- Có thể update code bất cứ lúc nào
