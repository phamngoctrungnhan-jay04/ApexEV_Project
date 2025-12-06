# 💰 HƯỚNG DẪN TIẾT KIỆM CHI PHÍ AWS

## 📊 TỔNG QUAN CHI PHÍ

### **Khi TẤT CẢ đang chạy 24/7:**
```
ECS Fargate (1 task):     $15/tháng
RDS db.t3.micro:          $12/tháng (Free Tier: $0)
ElastiCache (optional):   $12/tháng (Free Tier: $0)
ALB:                      $20/tháng
VPC Endpoints (6):        $44/tháng
S3 Storage:               $1/tháng
ECR:                      $0 (< 500MB)
─────────────────────────────────────────
TỔNG:                     $104/tháng
Free Tier:                $80/tháng
```

### **Sau khi tối ưu (chỉ chạy 8h/ngày, 5 ngày/tuần):**
```
ECS Fargate:              $5/tháng (chỉ chạy 40h/tuần)
RDS:                      $0 (stop khi không dùng)
VPC Endpoints:            $15/tháng (chỉ chạy 40h/tuần)
ALB:                      $7/tháng (xóa khi không dùng)
S3:                       $1/tháng
─────────────────────────────────────────
TỔNG:                     $28/tháng
TIẾT KIỆM:                $76/tháng (~73%)
```

---

## 🔄 QUY TRÌNH BẬT/TẮT HÀNG NGÀY

### **Khi BẮT ĐẦU làm việc (8:00 AM):**

```bash
cd aws-deployment
bash start-all.sh
```

**Script sẽ:**
1. ✅ Start RDS Database (5-10 phút)
2. ✅ Tạo VPC Endpoints (2 phút)
3. ✅ Start ECS Service (3 phút)
4. ✅ Check ALB status

**Thời gian:** ~15 phút  
**Chi phí:** ~$0.50/ngày

---

### **Khi NGHỈ (6:00 PM):**

```bash
cd aws-deployment
bash stop-all.sh
```

**Script sẽ:**
1. ✅ Stop ECS Service (desired count = 0)
2. ✅ Stop RDS Database
3. ✅ Delete VPC Endpoints (giữ S3 Gateway)
4. ⚠️  Hỏi có xóa ALB không

**Thời gian:** ~2 phút  
**Tiết kiệm:** ~$2.50/ngày

---

## 📋 CHI TIẾT CÁC RESOURCES

### **1. ECS FARGATE**

**Chi phí:**
- $0.04048/giờ cho 0.25 vCPU + 0.5GB RAM
- Chạy 24/7: $0.04048 × 730 = $29.55/tháng
- Chạy 8h/ngày: $0.04048 × 240 = $9.72/tháng

**Cách tiết kiệm:**
```bash
# Stop (set desired count = 0)
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --desired-count 0

# Start (set desired count = 1)
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --desired-count 1
```

**Lưu ý:**
- ✅ Stop/Start ngay lập tức
- ✅ Không mất data
- ✅ Không cần deploy lại

---

### **2. RDS MySQL**

**Chi phí:**
- db.t3.micro: $0.017/giờ = $12.41/tháng
- Storage 20GB: $2.30/tháng
- Tổng: $14.71/tháng
- **Free Tier:** $0 (trong 12 tháng đầu)

**Cách tiết kiệm:**
```bash
# Stop (tối đa 7 ngày)
aws rds stop-db-instance \
  --db-instance-identifier apexev-db

# Start
aws rds start-db-instance \
  --db-instance-identifier apexev-db
```

**Lưu ý:**
- ⚠️  RDS tự động start lại sau 7 ngày
- ✅ Data được giữ nguyên
- ⏱️  Start mất 5-10 phút

---

### **3. VPC ENDPOINTS**

**Chi phí:**
- Interface Endpoint: $0.01/giờ = $7.30/tháng
- 6 endpoints: $43.80/tháng
- Data transfer: $0.01/GB
- S3 Gateway: **FREE**

**Endpoints cần thiết:**
```
✅ ECR API         - Pull image metadata      $7.30/tháng
✅ ECR DKR         - Pull Docker layers       $7.30/tháng
✅ CloudWatch Logs - Ghi logs                 $7.30/tháng
✅ S3 Gateway      - Truy cập S3              FREE
⚠️  Secrets Manager - Lấy secrets (optional)  $7.30/tháng
⚠️  SNS            - Notifications (optional) $7.30/tháng
⚠️  Bedrock        - AI services (optional)   $7.30/tháng
```

**Cách tiết kiệm:**
```bash
# Delete endpoints (giữ S3 Gateway)
aws ec2 delete-vpc-endpoints \
  --vpc-endpoint-ids vpce-xxx vpce-yyy

# Recreate khi cần
bash 03b-vpc-endpoints-setup.sh
```

**Lưu ý:**
- ✅ Xóa/tạo lại nhanh (2 phút)
- ✅ Không ảnh hưởng data
- 💡 Chỉ giữ endpoints thực sự cần thiết

---

### **4. APPLICATION LOAD BALANCER**

**Chi phí:**
- $0.0225/giờ = $16.43/tháng
- LCU charges: ~$3-5/tháng
- Tổng: ~$20/tháng

**Cách tiết kiệm:**
```bash
# Delete ALB
aws elbv2 delete-load-balancer \
  --load-balancer-arn arn:aws:...

# Delete Target Group
aws elbv2 delete-target-group \
  --target-group-arn arn:aws:...

# Recreate khi cần
bash 05-alb-setup.sh
```

**Lưu ý:**
- ⚠️  Mất DNS name khi xóa
- ⚠️  Cần update DNS nếu dùng custom domain
- 💡 Nếu không xóa: Vẫn tốn $20/tháng

---

### **5. S3 & ECR**

**Chi phí:**
- S3 Storage: $0.023/GB = ~$1/tháng (50GB)
- ECR: FREE (< 500MB)

**Cách tiết kiệm:**
- ✅ Không cần stop/start
- ✅ Chỉ tốn tiền khi có data
- 💡 Xóa old images trong ECR

---

## 📅 LỊCH TRÌNH KHUYẾN NGHỊ

### **Development/Testing:**

```
Thứ 2-6:
  8:00 AM  → bash start-all.sh
  6:00 PM  → bash stop-all.sh

Thứ 7-CN:
  → Tắt cả tuần
```

**Chi phí:** ~$28/tháng

---

### **Demo/Presentation:**

```
Chỉ bật khi cần demo:
  → bash start-all.sh (trước 15 phút)
  → Demo
  → bash stop-all.sh (ngay sau demo)
```

**Chi phí:** ~$10/tháng (4-5 demos/tháng)

---

### **Production:**

```
Chạy 24/7:
  → Không stop/start
  → Tối ưu bằng cách:
    - Xóa endpoints không cần thiết
    - Dùng Reserved Instances (giảm 30-50%)
    - Dùng Savings Plans
```

**Chi phí:** ~$80-100/tháng

---

## 🎯 CHIẾN LƯỢC TỐI ƯU CHI PHÍ

### **Mức 1: Tiết kiệm CƠ BẢN (~$20/tháng)**

```bash
# Chỉ giữ những gì cần thiết
- ✅ ECS: Chạy 24/7
- ✅ RDS: Free Tier
- ✅ S3 Gateway: FREE
- ❌ Xóa: VPC Endpoints khác
- ❌ Xóa: ALB (dùng ECS public IP)
```

**Phù hợp:** Development, học tập

---

### **Mức 2: Tiết kiệm TRUNG BÌNH (~$40/tháng)**

```bash
# Bật/tắt hàng ngày
- ✅ ECS: 8h/ngày
- ✅ RDS: Stop khi không dùng
- ✅ VPC Endpoints: Chỉ ECR + Logs
- ✅ ALB: Giữ lại
```

**Phù hợp:** Testing, staging

---

### **Mức 3: PRODUCTION (~$80/tháng)**

```bash
# Chạy 24/7 với tối ưu
- ✅ ECS: 24/7
- ✅ RDS: 24/7
- ✅ VPC Endpoints: Đầy đủ
- ✅ ALB: 24/7
- ✅ CloudWatch: Monitoring
```

**Phù hợp:** Production, khách hàng thực

---

## 🔧 SCRIPTS ĐÃ TẠO

### **1. `00-vpc-setup.sh`**
Tạo Private Subnets cho kiến trúc

### **2. `03b-vpc-endpoints-setup.sh`**
Tạo VPC Endpoints (ECR, S3, Logs, SNS, Bedrock)

### **3. `start-all.sh`** ⭐
Bật tất cả resources (chạy mỗi sáng)

### **4. `stop-all.sh`** ⭐
Tắt tất cả resources (chạy mỗi tối)

---

## 📊 BẢNG SO SÁNH

| Scenario | ECS | RDS | VPC Endpoints | ALB | Chi phí/tháng |
|----------|-----|-----|---------------|-----|---------------|
| **24/7 Full** | 24/7 | 24/7 | 6 endpoints | Yes | $104 |
| **24/7 Minimal** | 24/7 | 24/7 | S3 only | Yes | $57 |
| **8h/day** | 8h | Stop | 3 endpoints | Yes | $40 |
| **8h/day Minimal** | 8h | Stop | S3 only | No | $15 |
| **Demo only** | On-demand | Stop | On-demand | No | $10 |

---

## ✅ CHECKLIST HÀNG NGÀY

### **Buổi sáng (8:00 AM):**
- [ ] Chạy `bash start-all.sh`
- [ ] Đợi 15 phút
- [ ] Test health check: `curl http://ALB_DNS/actuator/health`
- [ ] Bắt đầu làm việc

### **Buổi tối (6:00 PM):**
- [ ] Commit code lên Git
- [ ] Chạy `bash stop-all.sh`
- [ ] Confirm stop
- [ ] Về nhà 🏠

---

## 💡 TIPS & TRICKS

### **1. Tự động hóa với Cron (Linux/Mac):**
```bash
# Bật lúc 8:00 AM
0 8 * * 1-5 cd /path/to/aws-deployment && bash start-all.sh

# Tắt lúc 6:00 PM
0 18 * * 1-5 cd /path/to/aws-deployment && bash stop-all.sh
```

### **2. Tự động hóa với Task Scheduler (Windows):**
- Tạo task chạy `wsl bash start-all.sh` lúc 8:00 AM
- Tạo task chạy `wsl bash stop-all.sh` lúc 6:00 PM

### **3. Monitoring chi phí:**
```bash
# Xem chi phí tháng này
aws ce get-cost-and-usage \
  --time-period Start=2024-11-01,End=2024-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### **4. Set billing alerts:**
- AWS Console → Billing → Budgets
- Tạo budget: $50/tháng
- Alert khi vượt 80% ($40)

---

## 🎓 KẾT LUẬN

**Cho ApexEV project:**

1. **Hiện tại (Development):**
   - Dùng scripts `start-all.sh` và `stop-all.sh`
   - Chỉ bật khi làm việc
   - Chi phí: ~$28/tháng

2. **Khi demo cho khách:**
   - Bật trước 15 phút
   - Demo
   - Tắt ngay sau đó
   - Chi phí: ~$10/tháng

3. **Khi production:**
   - Chạy 24/7
   - Xóa endpoints không cần thiết
   - Chi phí: ~$80/tháng

**Tiết kiệm tối đa: $76/tháng (~73%)** 🎉
