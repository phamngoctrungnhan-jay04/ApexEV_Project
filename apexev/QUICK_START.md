# 🚀 QUICK START - DEPLOY APEXEV LÊN AWS

## 📋 CHUẨN BỊ (5 phút)

### **1. Kiểm tra Docker**
```bash
docker --version
docker ps
```

### **2. Kiểm tra AWS CLI**
```bash
aws --version
aws sts get-caller-identity
```

### **3. Kiểm tra Docker Image**
```bash
docker images | findstr apexev
```

Phải thấy: `apexev   latest   ...`

---

## 🎯 BƯỚC 1: ECR (15 phút)

```bash
cd aws-deployment
bash 01-ecr-setup.sh
```

**Chờ kết quả:** ✅ HOÀN THÀNH BƯỚC 1: ECR SETUP

---

## 🎯 BƯỚC 2: RDS (30 phút)

**⚠️ QUAN TRỌNG:** Mở file `02-rds-setup.sh` và đổi password!

```bash
# Đổi dòng này:
DB_PASSWORD="ApexEV2024SecurePassword!"
```

**Sau đó chạy:**
```bash
bash 02-rds-setup.sh
```

**Chờ 10-15 phút** cho RDS khởi động.

**Kết quả:** File `rds-info.txt` được tạo

---

## 🎯 BƯỚC 3: S3 (10 phút)

```bash
bash 03-s3-setup.sh
```

**Kết quả:** File `s3-info.txt` được tạo

---

## ✅ HOÀN THÀNH 3 BƯỚC ĐẦU

**Kiểm tra:**
```bash
cat rds-info.txt
cat s3-info.txt
```

**Cho tôi biết nội dung 2 files này để tôi tạo scripts tiếp theo!**

---

## 📞 GẶP VẤN ĐỀ?

Copy error message và cho tôi biết!
