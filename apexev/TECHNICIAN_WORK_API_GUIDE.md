# Hướng dẫn API Quản lý Công việc - TECHNICIAN

## Tổng quan
Module này cung cấp các API cho kỹ thuật viên (TECHNICIAN) để quản lý công việc được giao.

## Các chức năng chính

1. ✅ Xem danh sách công việc được giao
2. ✅ Xem chi tiết công việc
3. ✅ Cập nhật trạng thái công việc
4. ✅ Thêm/cập nhật ghi chú kỹ thuật viên

---

## API Endpoints

### 1. Lấy danh sách công việc được giao
```
GET /api/technician/my-works
```

**Authorization**: Bearer Token (TECHNICIAN role)

**Response**:
```json
[
  {
    "id": 5,
    "status": "INSPECTION",
    "createdAt": "2024-11-09T10:00:00",
    "vehicleLicensePlate": "30A-12345",
    "vehicleModel": "Vento S",
    "vehicleBrand": "VinFast",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "customerDescription": "Xe bị kêu lạ ở bánh trước, phanh không ăn"
  },
  {
    "id": 8,
    "status": "IN_PROGRESS",
    "createdAt": "2024-11-08T14:30:00",
    "vehicleLicensePlate": "51G-98765",
    "vehicleModel": "VF e34",
    "vehicleBrand": "VinFast",
    "customerName": "Trần Thị B",
    "customerPhone": "0912345678",
    "customerDescription": "Thay dầu định kỳ"
  }
]
```

**Lưu ý**: 
- Chỉ hiển thị công việc chưa hoàn thành (loại trừ COMPLETED và CANCELLED)
- Sắp xếp theo thời gian tạo

---

### 2. Xem chi tiết công việc
```
GET /api/technician/works/{id}
```

**Authorization**: Bearer Token (TECHNICIAN role)

**Path Parameters**:
- `id`: ID của ServiceOrder

**Response**:
```json
{
  "id": 5,
  "status": "INSPECTION",
  "createdAt": "2024-11-09T10:00:00",
  "vehicleLicensePlate": "30A-12345",
  "vehicleModel": "Vento S",
  "vehicleBrand": "VinFast",
  "vehicleVinNumber": "VF1234567890",
  "vehicleYearManufactured": 2023,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerDescription": "Xe bị kêu lạ ở bánh trước, phanh không ăn",
  "advisorNotes": "Khách hàng cần gấp, ưu tiên xử lý",
  "technicianNotes": "Đã kiểm tra, phát hiện má phanh mòn và đĩa phanh bị rạn",
  "serviceAdvisorName": "Lê Văn C",
  "orderItems": [
    {
      "id": 1,
      "itemType": "PART",
      "itemName": "Má phanh Vento S",
      "quantity": 1,
      "unitPrice": 280000,
      "status": "APPROVED"
    },
    {
      "id": 2,
      "itemType": "SERVICE",
      "itemName": "Công thay má phanh",
      "quantity": 1,
      "unitPrice": 100000,
      "status": "APPROVED"
    }
  ]
}
```

**Lưu ý**:
- Chỉ xem được công việc được giao cho mình
- Hiển thị đầy đủ thông tin xe, khách hàng, ghi chú và danh sách items

---

### 3. Cập nhật trạng thái công việc
```
PATCH /api/technician/works/{id}/status
```

**Authorization**: Bearer Token (TECHNICIAN role)

**Path Parameters**:
- `id`: ID của ServiceOrder

**Request Body**:
```json
{
  "newStatus": "IN_PROGRESS"
}
```

**Các trạng thái hợp lệ**:
- `INSPECTION` → `QUOTING` (khi cần báo giá thêm)
- `INSPECTION` → `IN_PROGRESS` (khi không cần báo giá)
- `QUOTING` → `IN_PROGRESS` (sau khi customer approve)
- `WAITING_FOR_PARTS` → `IN_PROGRESS` (khi phụ tùng đã về)
- `IN_PROGRESS` → `WAITING_FOR_PARTS` (khi thiếu phụ tùng)
- `IN_PROGRESS` → `READY_FOR_INVOICE` (khi hoàn thành công việc)

**Response**:
```json
{
  "id": 5,
  "status": "IN_PROGRESS",
  ...
}
```

**Lưu ý**:
- Hệ thống sẽ validate chuyển trạng thái hợp lệ
- Khi chuyển sang `READY_FOR_INVOICE`, hệ thống tự động set `completedAt`

---

### 4. Thêm/cập nhật ghi chú kỹ thuật viên
```
PATCH /api/technician/works/{id}/notes
```

**Authorization**: Bearer Token (TECHNICIAN role)

**Path Parameters**:
- `id`: ID của ServiceOrder

**Request Body**:
```json
{
  "notes": "Đã kiểm tra hệ thống phanh. Phát hiện má phanh mòn 80%, đĩa phanh bị rạn. Đề xuất thay cả bộ phanh trước."
}
```

**Response**:
```json
{
  "id": 5,
  "technicianNotes": "Đã kiểm tra hệ thống phanh. Phát hiện má phanh mòn 80%, đĩa phanh bị rạn. Đề xuất thay cả bộ phanh trước.",
  ...
}
```

**Lưu ý**:
- Ghi chú sẽ ghi đè lên ghi chú cũ (không append)
- Cố vấn và quản lý có thể xem được ghi chú này

---

## Luồng nghiệp vụ Technician

### Kịch bản 1: Kiểm tra xe và không cần báo giá thêm
```
1. Technician nhận công việc (status = INSPECTION)
2. GET /api/technician/my-works → Xem danh sách
3. GET /api/technician/works/{id} → Xem chi tiết
4. Kiểm tra xe
5. PATCH /api/technician/works/{id}/notes → Ghi chú kết quả kiểm tra
6. PATCH /api/technician/works/{id}/status → Chuyển sang IN_PROGRESS
7. Thực hiện công việc
8. PATCH /api/technician/works/{id}/status → Chuyển sang READY_FOR_INVOICE
```

### Kịch bản 2: Kiểm tra xe và cần báo giá thêm
```
1. Technician nhận công việc (status = INSPECTION)
2. GET /api/technician/works/{id} → Xem chi tiết
3. Kiểm tra xe, phát hiện cần thay thêm phụ tùng
4. PATCH /api/technician/works/{id}/notes → Ghi chú phát hiện
5. PATCH /api/technician/works/{id}/status → Chuyển sang QUOTING
6. [Tạo ServiceOrderItem - sẽ làm ở module tiếp theo]
7. Chờ customer approve
8. PATCH /api/technician/works/{id}/status → Chuyển sang IN_PROGRESS
9. Thực hiện công việc
10. PATCH /api/technician/works/{id}/status → Chuyển sang READY_FOR_INVOICE
```

### Kịch bản 3: Đang làm nhưng thiếu phụ tùng
```
1. Đang làm việc (status = IN_PROGRESS)
2. Phát hiện thiếu phụ tùng
3. PATCH /api/technician/works/{id}/notes → Ghi chú thiếu phụ tùng gì
4. PATCH /api/technician/works/{id}/status → Chuyển sang WAITING_FOR_PARTS
5. Chờ phụ tùng về
6. PATCH /api/technician/works/{id}/status → Chuyển lại IN_PROGRESS
7. Hoàn thành
8. PATCH /api/technician/works/{id}/status → Chuyển sang READY_FOR_INVOICE
```

---

## Các file đã tạo

### DTO Response (3 files):
1. `TechnicianWorkResponse.java` - DTO danh sách công việc (summary)
2. `TechnicianWorkDetailResponse.java` - DTO chi tiết công việc
3. `WorkOrderItemResponse.java` - DTO cho items trong công việc

### DTO Request (2 files):
4. `UpdateWorkStatusRequest.java` - DTO cập nhật trạng thái
5. `AddTechnicianNotesRequest.java` - DTO thêm ghi chú

### Service (2 files):
6. `TechnicianWorkService.java` - Interface
7. `TechnicianWorkServiceImpl.java` - Implementation

### Controller (1 file):
8. `TechnicianWorkController.java` - REST API endpoints

---

## Validation & Security

### Kiểm tra quyền:
- Tất cả endpoint yêu cầu role `TECHNICIAN`
- Technician chỉ xem/sửa được công việc được giao cho mình
- Không thể xem công việc của technician khác

### Validation trạng thái:
- Hệ thống validate chuyển trạng thái hợp lệ
- Không cho phép chuyển trạng thái tùy ý
- Throw exception nếu chuyển trạng thái không hợp lệ

### Validation dữ liệu:
- `newStatus` không được null
- `notes` không được blank

---

## Error Responses

### 404 Not Found:
```json
{
  "message": "Không tìm thấy công việc với ID: 999"
}
```

### 403 Forbidden:
```json
{
  "message": "Bạn không có quyền truy cập công việc này."
}
```

### 400 Bad Request:
```json
{
  "message": "Không thể chuyển từ trạng thái INSPECTION sang READY_FOR_INVOICE"
}
```

---

## Mở rộng tiếp theo

Module tiếp theo sẽ làm:
1. ✅ Tạo ServiceOrderItem (yêu cầu phụ tùng/dịch vụ thêm)
2. ✅ Chọn và điền ServiceChecklist
3. ✅ Xem danh sách ChecklistTemplate
4. ✅ Gửi notification cho cố vấn khi hoàn thành

---

## Testing với Postman/Swagger

### Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

### Test flow:
1. Login với tài khoản TECHNICIAN
2. Copy Bearer token
3. Gọi các API theo thứ tự trong kịch bản
4. Kiểm tra response và database
