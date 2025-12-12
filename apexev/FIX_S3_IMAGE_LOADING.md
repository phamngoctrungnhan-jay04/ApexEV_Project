# Sửa lỗi: Không load được ảnh trên AWS Production

## 🔍 Vấn đề

Khi deploy lên AWS, ảnh không load được với lỗi:
```
Image load error: https://apexev-media.s3.ap-southeast-1.amazonaws.com/...?X-Amz-Security-Token=...
```

**Nguyên nhân:** 
- Backend đang dùng **presigned URL với temporary credentials** (IAM Role), tạo URL rất dài
- URL có `X-Amz-Security-Token` dễ gặp lỗi CORS và timeout
- Không cần thiết phải dùng presigned URL nếu ảnh không nhạy cảm

## ✅ Giải pháp

Đổi S3 bucket thành **public read** và dùng **public URL đơn giản**:
- URL cũ (phức tạp): `https://bucket.s3.region.amazonaws.com/key?X-Amz-Security-Token=...&X-Amz-Signature=...`
- URL mới (đơn giản): `https://bucket.s3.region.amazonaws.com/key`

---

## 📋 Các bước thực hiện

### Bước 1: Cấu hình S3 Bucket (AWS Console hoặc CLI)

**Option A: Dùng PowerShell Script (Khuyến nghị)**

```powershell
cd C:\Project OJT\ApexEV_BE\apexev
.\aws-deployment\configure-s3-public.ps1
```

**Option B: Thủ công qua AWS Console**

1. **Tắt Block Public Access:**
   - Vào S3 → Bucket `apexev-media` → Permissions
   - Edit **Block public access** → **Tắt hết 4 options** → Save

2. **Apply Bucket Policy:**
   - Permissions → Bucket policy → Edit
   - Paste nội dung file `aws-deployment/s3-public-read-policy.json`
   - Save changes

3. **Configure CORS:**
   - Permissions → Cross-origin resource sharing (CORS) → Edit
   - Paste nội dung file `aws-deployment/s3-cors-config.json`
   - Save changes

### Bước 2: Cập nhật Backend Code

**File đã được sửa:**
- ✅ `S3Service.java` - Thêm logic chọn public URL hoặc presigned URL
- ✅ `application-prod.properties` - Thêm config `aws.s3.use-public-url=true`

**Kiểm tra:**
```bash
cd C:\Project OJT\ApexEV_BE\apexev
Get-Content src\main\resources\application-prod.properties | Select-String "aws.s3"
```

Phải thấy:
```properties
aws.s3.bucket-name=${AWS_S3_BUCKET_NAME:apexev-media}
aws.s3.region=${AWS_REGION:ap-southeast-1}
aws.s3.use-public-url=true
```

### Bước 3: Build & Deploy Backend

```powershell
cd C:\Project OJT\ApexEV_BE\apexev

# Build
.\mvnw.cmd clean package -DskipTests

# Deploy lên AWS (tùy theo cách deploy của bạn)
# Ví dụ: upload lên ECS, Elastic Beanstalk, hoặc EC2
```

### Bước 4: Restart Backend Service trên AWS

- **ECS/Fargate:** Force new deployment
  ```bash
  aws ecs update-service --cluster YOUR_CLUSTER --service YOUR_SERVICE --force-new-deployment
  ```

- **Elastic Beanstalk:** Deploy version mới
  ```bash
  eb deploy
  ```

- **EC2:** Restart service
  ```bash
  ssh ec2-user@YOUR_IP
  sudo systemctl restart apexev
  ```

### Bước 5: Test

1. Upload ảnh mới từ Frontend
2. Kiểm tra URL trong DevTools Console:
   - URL cũ (lỗi): `https://apexev-media.s3...?X-Amz-Security-Token=...`
   - URL mới (OK): `https://apexev-media.s3.ap-southeast-1.amazonaws.com/checklist-evidence/2025-12-09_abc123.jpg`

3. Mở URL trực tiếp trong browser → Phải thấy ảnh

---

## 🔒 Bảo mật

**Lưu ý:** S3 bucket giờ là **public read**, ai cũng có thể xem ảnh nếu biết URL.

**Giải pháp nếu cần bảo mật hơn:**

1. **Chỉ public folder `checklist-evidence`:**
   - Sửa Bucket Policy:
     ```json
     "Resource": "arn:aws:s3:::apexev-media/checklist-evidence/*"
     ```

2. **Dùng CloudFront + Signed URL:**
   - Đặt S3 private
   - Dùng CloudFront distribution với OAI (Origin Access Identity)
   - Generate CloudFront signed URL thay vì S3 presigned URL

3. **Watermark ảnh nhạy cảm:**
   - Thêm watermark "APEX EV - Confidential" vào ảnh trước khi upload

---

## 🐛 Troubleshooting

### Lỗi "Access Denied" khi truy cập public URL

**Nguyên nhân:** Block Public Access vẫn bật

**Giải pháp:**
```bash
aws s3api put-public-access-block \
  --bucket apexev-media \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### Lỗi CORS vẫn còn

**Nguyên nhân:** CORS chưa được cấu hình đúng

**Giải pháp:**
```bash
aws s3api put-bucket-cors \
  --bucket apexev-media \
  --cors-configuration file://aws-deployment/s3-cors-config.json
```

### Backend vẫn trả về presigned URL

**Nguyên nhân:** Environment variable chưa được set

**Giải pháp:**
- Kiểm tra ECS Task Definition có biến `aws.s3.use-public-url=true` không
- Hoặc set trong `application-prod.properties` hardcode
- Restart service sau khi update

---

## 📝 Checklist Deploy

- [ ] S3 Bucket: Block Public Access tắt
- [ ] S3 Bucket: Bucket Policy applied (public read)
- [ ] S3 Bucket: CORS configured
- [ ] Backend: `S3Service.java` updated
- [ ] Backend: `application-prod.properties` có `aws.s3.use-public-url=true`
- [ ] Backend: Build & deploy lại
- [ ] Backend: Restart service
- [ ] Test: Upload ảnh mới và kiểm tra URL
- [ ] Test: Mở public URL trong browser

---

## 🎯 Kết quả mong đợi

✅ URL đơn giản: `https://apexev-media.s3.ap-southeast-1.amazonaws.com/checklist-evidence/2025-12-09_abc123.jpg`

✅ Không còn `X-Amz-Security-Token`, `X-Amz-Signature`

✅ Ảnh load nhanh, không lỗi CORS

✅ Frontend có thể xem ảnh trong OrderDetail, MaintenanceChecklist, JobList
