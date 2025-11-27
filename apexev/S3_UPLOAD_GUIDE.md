# 📸 HƯỚNG DẪN SỬ DỤNG S3 UPLOAD

## 🎯 LOGIC HOẠT ĐỘNG

```
┌─────────────┐
│ TECHNICIAN  │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 1️⃣ Upload file
       ▼
┌──────────────────────────────────────────┐
│  POST /api/files/upload                  │
│  - Validate file (type, size)            │
│  - Upload to S3                          │
│  - Return S3 key                         │
└──────┬───────────────────────────────────┘
       │
       │ 2️⃣ S3 key: "checklist/2024-11-25_abc123.jpg"
       ▼
┌──────────────────────────────────────────┐
│  Lưu vào Database                        │
│  service_checklist_results               │
│  - s3Key: "checklist/2024-11-25_abc123.jpg" │
│  - mediaType: "IMAGE"                    │
└──────────────────────────────────────────┘
       │
       │ 3️⃣ Customer muốn xem
       ▼
┌──────────────────────────────────────────┐
│  GET /api/files/view?key=checklist/...  │
│  - Generate pre-signed URL (60 phút)    │
│  - Return URL                            │
└──────┬───────────────────────────────────┘
       │
       │ 4️⃣ Pre-signed URL
       ▼
┌──────────────────────────────────────────┐
│  Customer xem ảnh/video                  │
│  URL hết hạn sau 60 phút                 │
└──────────────────────────────────────────┘
```

---

## 📝 API ENDPOINTS

### **1. Upload File**

**Endpoint:** `POST /api/files/upload`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary file]
folder: "checklist" (optional, default: "checklist")
```

**Response:**
```json
{
  "s3Key": "checklist/2024-11-25_abc123.jpg",
  "mediaType": "IMAGE",
  "fileName": "photo.jpg",
  "message": "Upload thành công"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:8081/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=checklist"
```

---

### **2. Get File URL (View)**

**Endpoint:** `GET /api/files/view`

**Headers:**
```
Authorization: Bearer {jwt_token} (optional)
```

**Query Parameters:**
```
key: "checklist/2024-11-25_abc123.jpg" (required)
expiration: 60 (optional, default: 60 minutes)
```

**Response:**
```json
{
  "url": "https://apexev-media-029930584678.s3.ap-southeast-1.amazonaws.com/checklist/2024-11-25_abc123.jpg?X-Amz-Algorithm=...",
  "expiresIn": "60 minutes"
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:8081/api/files/view?key=checklist/2024-11-25_abc123.jpg&expiration=30"
```

---

### **3. Delete File**

**Endpoint:** `DELETE /api/files/delete`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
```
key: "checklist/2024-11-25_abc123.jpg" (required)
```

**Response:**
```json
{
  "message": "Xóa file thành công",
  "deletedKey": "checklist/2024-11-25_abc123.jpg"
}
```

**Curl Example:**
```bash
curl -X DELETE "http://localhost:8081/api/files/delete?key=checklist/2024-11-25_abc123.jpg" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 💻 FRONTEND IMPLEMENTATION

### **React/React Native Example:**

```javascript
// 1. Upload file
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'checklist');
  
  const response = await fetch('http://localhost:8081/api/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log('S3 Key:', data.s3Key);
  
  return data.s3Key; // Lưu vào state hoặc submit form
};

// 2. Get file URL để hiển thị
const getFileUrl = async (s3Key) => {
  const response = await fetch(
    `http://localhost:8081/api/files/view?key=${s3Key}&expiration=30`,
    {
      method: 'GET'
    }
  );
  
  const data = await response.json();
  return data.url; // URL để hiển thị ảnh/video
};

// 3. Hiển thị ảnh
const ImageViewer = ({ s3Key }) => {
  const [imageUrl, setImageUrl] = useState(null);
  
  useEffect(() => {
    getFileUrl(s3Key).then(url => setImageUrl(url));
  }, [s3Key]);
  
  return imageUrl ? <img src={imageUrl} alt="Evidence" /> : <p>Loading...</p>;
};

// 4. Submit checklist với S3 key
const submitChecklist = async (checklistData, s3Key) => {
  await fetch('http://localhost:8081/api/technician/checklist/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      ...checklistData,
      s3Key: s3Key,  // ← Lưu S3 key vào DB
      mediaType: 'IMAGE'
    })
  });
};
```

---

## 🗄️ DATABASE SCHEMA

```sql
-- Đã có sẵn trong ServiceChecklistResult entity
ALTER TABLE service_checklist_results 
ADD COLUMN media_type VARCHAR(20) COMMENT 'IMAGE or VIDEO';

-- Rename column nếu cần
ALTER TABLE service_checklist_results 
CHANGE COLUMN media_url s3_key VARCHAR(1000) COMMENT 'S3 file key';
```

---

## 🔧 CONFIGURATION

### **application.properties:**

```properties
# AWS S3 Configuration
aws.access-key-id=${AWS_ACCESS_KEY_ID:your-access-key}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY:your-secret-key}
aws.s3.region=${AWS_REGION:ap-southeast-1}
aws.s3.bucket-name=${AWS_S3_BUCKET:apexev-media-029930584678}

# File Upload Limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### **Environment Variables (Production):**

```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_REGION=ap-southeast-1
export AWS_S3_BUCKET=apexev-media-029930584678
```

---

## 🧪 TESTING

### **1. Test Upload (Postman):**

```
POST http://localhost:8081/api/files/upload
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body (form-data):
  file: [select file]
  folder: checklist
```

### **2. Test View:**

```
GET http://localhost:8081/api/files/view?key=checklist/2024-11-25_abc123.jpg
```

### **3. Test với curl:**

```bash
# Upload
curl -X POST http://localhost:8081/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "folder=checklist"

# View
curl -X GET "http://localhost:8081/api/files/view?key=checklist/2024-11-25_abc123.jpg"
```

---

## 🔒 SECURITY

### **1. Pre-signed URL:**
- ✅ URL có thời hạn (default: 60 phút)
- ✅ Không cần AWS credentials để xem
- ✅ Tự động hết hạn

### **2. Upload Permission:**
- ✅ Chỉ TECHNICIAN, SERVICE_ADVISOR, ADMIN được upload
- ✅ Validate file type (jpg, png, webp, mp4)
- ✅ Validate file size (max 10MB)

### **3. S3 Bucket Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUrls",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::apexev-media-029930584678/*",
      "Condition": {
        "StringLike": {
          "aws:Referer": "https://apexev.com/*"
        }
      }
    }
  ]
}
```

---

## 📊 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│  TECHNICIAN UPLOAD FLOW                                 │
└─────────────────────────────────────────────────────────┘

1. Technician chọn ảnh/video
   ↓
2. POST /api/files/upload
   ↓
3. Backend validate file
   ↓
4. Upload to S3
   ↓
5. S3 trả về key: "checklist/2024-11-25_abc123.jpg"
   ↓
6. Backend trả về response với s3Key
   ↓
7. Frontend lưu s3Key vào state
   ↓
8. Technician điền form checklist
   ↓
9. Submit form với s3Key
   ↓
10. Backend lưu s3Key vào database

┌─────────────────────────────────────────────────────────┐
│  CUSTOMER VIEW FLOW                                     │
└─────────────────────────────────────────────────────────┘

1. Customer xem báo giá
   ↓
2. Backend query database, lấy s3Key
   ↓
3. GET /api/files/view?key={s3Key}
   ↓
4. Backend generate pre-signed URL (60 phút)
   ↓
5. Trả về URL cho frontend
   ↓
6. Frontend hiển thị ảnh/video từ URL
   ↓
7. URL tự động hết hạn sau 60 phút
```

---

## ✅ CHECKLIST

- [ ] Đã thêm AWS SDK dependency vào pom.xml
- [ ] Đã tạo S3Config.java
- [ ] Đã tạo S3Service.java
- [ ] Đã tạo FileUploadController.java
- [ ] Đã cập nhật application.properties
- [ ] Đã set AWS credentials
- [ ] Đã test upload endpoint
- [ ] Đã test view endpoint
- [ ] Đã update ServiceChecklistResult entity
- [ ] Đã test end-to-end flow

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "The AWS Access Key Id you provided does not exist"**
```bash
# Check credentials
aws configure list

# Set lại credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```

### **Lỗi: "Access Denied"**
```bash
# Check IAM permissions
# User cần có policy: AmazonS3FullAccess hoặc custom policy
```

### **Lỗi: "File size exceeds maximum"**
```properties
# Tăng limit trong application.properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
```

---

## 🎓 KẾT LUẬN

**Ưu điểm của cách này:**
- ✅ Bảo mật cao (pre-signed URL có thời hạn)
- ✅ Linh hoạt (đổi bucket không cần update DB)
- ✅ Tiết kiệm storage (chỉ lưu key, không lưu full URL)
- ✅ Dễ maintain (centralized S3 logic)

**Sử dụng:**
1. Technician upload → Lưu s3Key vào DB
2. Customer xem → Generate pre-signed URL từ s3Key
3. URL tự động hết hạn → Bảo mật
