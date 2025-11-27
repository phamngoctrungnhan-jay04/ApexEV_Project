# 📋 CHECKLIST API - HƯỚNG DẪN SỬ DỤNG

## 🎯 FLOW HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 1: TECHNICIAN UPLOAD ẢNH                          │
└─────────────────────────────────────────────────────────┘

POST /api/files/upload
Request:
  - file: image.jpg
  - folder: "checklist"

Response:
{
  "s3Key": "checklist/2024-11-26_abc123.jpg",
  "mediaType": "IMAGE",
  "fileName": "image.jpg",
  "message": "Upload thành công"
}

┌─────────────────────────────────────────────────────────┐
│  BƯỚC 2: TECHNICIAN SUBMIT CHECKLIST ITEM              │
└─────────────────────────────────────────────────────────┘

POST /api/checklist/submit
Request:
{
  "checklistId": 1,
  "templateItemId": 5,
  "status": "FAILED",
  "technicianNotes": "Phanh trước bị mòn 80%, cần thay ngay",
  "s3Key": "checklist/2024-11-26_abc123.jpg",  ← S3 key từ bước 1
  "mediaType": "IMAGE"
}

Response:
{
  "id": 10,
  "checklistId": 1,
  "templateItemId": 5,
  "itemName": "Kiểm tra phanh trước",
  "status": "FAILED",
  "technicianNotes": "Phanh trước bị mòn 80%, cần thay ngay",
  "s3Key": "checklist/2024-11-26_abc123.jpg",
  "mediaType": "IMAGE",
  "mediaUrl": "https://apexev-media-xxx.s3.amazonaws.com/...?X-Amz-..."
}

┌─────────────────────────────────────────────────────────┐
│  BƯỚC 3: CUSTOMER XEM KẾT QUẢ                          │
└─────────────────────────────────────────────────────────┘

GET /api/checklist/1/results

Response:
[
  {
    "id": 10,
    "checklistId": 1,
    "templateItemId": 5,
    "itemName": "Kiểm tra phanh trước",
    "status": "FAILED",
    "technicianNotes": "Phanh trước bị mòn 80%, cần thay ngay",
    "s3Key": "checklist/2024-11-26_abc123.jpg",
    "mediaType": "IMAGE",
    "mediaUrl": "https://apexev-media-xxx.s3.amazonaws.com/...?X-Amz-..."
  },
  {
    "id": 11,
    "checklistId": 1,
    "templateItemId": 6,
    "itemName": "Kiểm tra pin",
    "status": "PASSED",
    "technicianNotes": "Pin hoạt động tốt",
    "s3Key": null,
    "mediaType": null,
    "mediaUrl": null
  }
]
```

---

## 📝 API ENDPOINTS

### **1. Submit Checklist Item**

**Endpoint:** `POST /api/checklist/submit`

**Headers:**
```
Authorization: Bearer {technician_jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "checklistId": 1,
  "templateItemId": 5,
  "status": "FAILED",
  "technicianNotes": "Phanh trước bị mòn 80%",
  "s3Key": "checklist/2024-11-26_abc123.jpg",
  "mediaType": "IMAGE"
}
```

**Response:**
```json
{
  "id": 10,
  "checklistId": 1,
  "templateItemId": 5,
  "itemName": "Kiểm tra phanh trước",
  "status": "FAILED",
  "technicianNotes": "Phanh trước bị mòn 80%",
  "s3Key": "checklist/2024-11-26_abc123.jpg",
  "mediaType": "IMAGE",
  "mediaUrl": "https://apexev-media-xxx.s3.amazonaws.com/...?X-Amz-..."
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:8081/api/checklist/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checklistId": 1,
    "templateItemId": 5,
    "status": "FAILED",
    "technicianNotes": "Phanh trước bị mòn 80%",
    "s3Key": "checklist/2024-11-26_abc123.jpg",
    "mediaType": "IMAGE"
  }'
```

---

### **2. Get Checklist Results**

**Endpoint:** `GET /api/checklist/{checklistId}/results`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "id": 10,
    "checklistId": 1,
    "templateItemId": 5,
    "itemName": "Kiểm tra phanh trước",
    "status": "FAILED",
    "technicianNotes": "Phanh trước bị mòn 80%",
    "s3Key": "checklist/2024-11-26_abc123.jpg",
    "mediaType": "IMAGE",
    "mediaUrl": "https://apexev-media-xxx.s3.amazonaws.com/...?X-Amz-..."
  }
]
```

**Curl Example:**
```bash
curl -X GET http://localhost:8081/api/checklist/1/results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### **3. Get Single Checklist Item**

**Endpoint:** `GET /api/checklist/result/{resultId}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "id": 10,
  "checklistId": 1,
  "templateItemId": 5,
  "itemName": "Kiểm tra phanh trước",
  "status": "FAILED",
  "technicianNotes": "Phanh trước bị mòn 80%",
  "s3Key": "checklist/2024-11-26_abc123.jpg",
  "mediaType": "IMAGE",
  "mediaUrl": "https://apexev-media-xxx.s3.amazonaws.com/...?X-Amz-..."
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:8081/api/checklist/result/10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 💻 FRONTEND IMPLEMENTATION

### **React/React Native Example:**

```javascript
// 1. Upload ảnh
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('folder', 'checklist');
  
  const response = await fetch('http://localhost:8081/api/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${technicianToken}`
    },
    body: formData
  });
  
  const data = await response.json();
  return data.s3Key; // "checklist/2024-11-26_abc123.jpg"
};

// 2. Submit checklist item với s3Key
const submitChecklistItem = async (checklistData, s3Key) => {
  const response = await fetch('http://localhost:8081/api/checklist/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${technicianToken}`
    },
    body: JSON.stringify({
      checklistId: checklistData.checklistId,
      templateItemId: checklistData.templateItemId,
      status: checklistData.status,
      technicianNotes: checklistData.notes,
      s3Key: s3Key,  // ← S3 key từ bước 1
      mediaType: 'IMAGE'
    })
  });
  
  return await response.json();
};

// 3. Complete flow
const handleSubmitWithImage = async () => {
  try {
    // Upload image first
    const s3Key = await uploadImage(selectedImage);
    
    // Then submit checklist with s3Key
    const result = await submitChecklistItem({
      checklistId: 1,
      templateItemId: 5,
      status: 'FAILED',
      notes: 'Phanh trước bị mòn 80%'
    }, s3Key);
    
    console.log('Submitted:', result);
    alert('Submit thành công!');
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi khi submit!');
  }
};

// 4. Hiển thị kết quả cho customer
const ChecklistResults = ({ checklistId }) => {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetch(`http://localhost:8081/api/checklist/${checklistId}/results`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    })
    .then(res => res.json())
    .then(data => setResults(data));
  }, [checklistId]);
  
  return (
    <div>
      {results.map(item => (
        <div key={item.id}>
          <h3>{item.itemName}</h3>
          <p>Status: {item.status}</p>
          <p>Notes: {item.technicianNotes}</p>
          {item.mediaUrl && (
            <img src={item.mediaUrl} alt="Evidence" />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 🗄️ DATABASE

### **Bảng: service_checklist_results**

```sql
CREATE TABLE service_checklist_results (
    result_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    checklist_id BIGINT NOT NULL,
    template_item_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    technician_notes TEXT,
    media_url VARCHAR(1000),  -- Lưu S3 key
    FOREIGN KEY (checklist_id) REFERENCES service_checklists(checklist_id),
    FOREIGN KEY (template_item_id) REFERENCES checklist_template_items(template_item_id)
);
```

**Dữ liệu mẫu:**
```sql
INSERT INTO service_checklist_results 
(checklist_id, template_item_id, status, technician_notes, media_url)
VALUES 
(1, 5, 'FAILED', 'Phanh trước bị mòn 80%', 'checklist/2024-11-26_abc123.jpg');
```

---

## 🔒 SECURITY & PERMISSIONS

### **Submit Checklist:**
- ✅ Chỉ TECHNICIAN được submit
- ✅ Technician chỉ submit checklist của mình
- ✅ Validate checklist ownership

### **View Results:**
- ✅ TECHNICIAN: Chỉ xem checklist của mình
- ✅ SERVICE_ADVISOR: Xem tất cả
- ✅ CUSTOMER: Xem checklist của đơn hàng mình
- ✅ ADMIN: Xem tất cả

### **Media URL:**
- ✅ Pre-signed URL tự động hết hạn sau 60 phút
- ✅ Không cần AWS credentials để xem
- ✅ Bảo mật cao

---

## 🧪 TESTING

### **Test Flow:**

```bash
# 1. Upload image
curl -X POST http://localhost:8081/api/files/upload \
  -H "Authorization: Bearer TECHNICIAN_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "folder=checklist"

# Response: {"s3Key": "checklist/2024-11-26_abc123.jpg", ...}

# 2. Submit checklist with s3Key
curl -X POST http://localhost:8081/api/checklist/submit \
  -H "Authorization: Bearer TECHNICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checklistId": 1,
    "templateItemId": 5,
    "status": "FAILED",
    "technicianNotes": "Phanh trước bị mòn 80%",
    "s3Key": "checklist/2024-11-26_abc123.jpg",
    "mediaType": "IMAGE"
  }'

# 3. View results
curl -X GET http://localhost:8081/api/checklist/1/results \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

---

## 📊 FEATURES

### **✅ Đã implement:**
1. Upload ảnh/video lên S3
2. Submit checklist item với S3 key
3. Lưu S3 key vào database
4. Generate pre-signed URL tự động
5. View checklist results với media URL
6. Permission control
7. Update existing result

### **🎯 Use cases:**
- ✅ Technician upload ảnh hư hỏng
- ✅ Technician submit checklist với ảnh
- ✅ Customer xem ảnh bằng chứng
- ✅ Service Advisor review checklist
- ✅ Admin monitor tất cả

---

## 🎓 KẾT LUẬN

**Đã hoàn thành:**
- ✅ API upload file lên S3
- ✅ API submit checklist với S3 key
- ✅ API view checklist results
- ✅ Tự động generate pre-signed URL
- ✅ Permission control
- ✅ Database integration

**Flow hoàn chỉnh:**
1. Technician upload ảnh → Nhận S3 key
2. Technician submit checklist với S3 key
3. Backend lưu S3 key vào database
4. Customer xem → Backend generate pre-signed URL
5. Frontend hiển thị ảnh từ URL

**Bảo mật:**
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Pre-signed URL có thời hạn
- ✅ Ownership validation

Done! 🎉
