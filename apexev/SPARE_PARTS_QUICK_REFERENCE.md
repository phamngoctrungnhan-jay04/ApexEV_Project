# Spare Parts Module - Quick Reference Guide 🚀

**Module**: Spare Parts Management  
**Language**: Vietnamese (English notes)  
**Last Updated**: December 1, 2025

---

## 🎯 Module Overview (Tổng Quan Module)

### Tác vụ chính (Main Functions)

| Tác vụ | Endpoint | HTTP Method | Vai trò (Role) |
|--------|----------|-------------|---|
| **Tạo phụ tùng mới** | `/api/spare-parts/create` | POST | ADMIN, BUSINESS_MANAGER |
| **Xem chi tiết phụ tùng** | `/api/spare-parts/{id}` | GET | Authenticated |
| **Cập nhật phụ tùng** | `/api/spare-parts/{id}` | PUT | ADMIN, BUSINESS_MANAGER |
| **Xóa phụ tùng** | `/api/spare-parts/{id}` | DELETE | ADMIN, BUSINESS_MANAGER |
| **Kiểm tra tồn kho** | `/api/spare-parts/check-inventory` | POST | Authenticated |
| **Kiểm tra tồn kho (Hàng loạt)** | `/api/spare-parts/check-inventory-batch` | POST | Authenticated |
| **Điều chỉnh số lượng tồn kho** | `/api/spare-parts/{id}/adjust-inventory` | PATCH | ADMIN, BUSINESS_MANAGER, TECHNICIAN |
| **Sử dụng phụ tùng cho dịch vụ** | `/api/spare-parts/apply-to-service-order` | POST | SERVICE_ADVISOR, TECHNICIAN |
| **Xem phụ tùng hết hàng** | `/api/spare-parts/inventory/low-stock` | GET | ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR |

---

## 🔧 Common API Usage Examples

### 1️⃣ Tạo phụ tùng mới (Create a New Part)

**Endpoint**: `POST /api/spare-parts/create`

**Request Body**:
```json
{
  "partName": "Bơm nước Vento",
  "sku": "MP-VENTO-PUMP-001",
  "description": "Bơm nước chính cho Vento 2024",
  "quantityInStock": 50,
  "price": 1250000.00
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "partName": "Bơm nước Vento",
  "sku": "MP-VENTO-PUMP-001",
  "description": "Bơm nước chính cho Vento 2024",
  "quantityInStock": 50,
  "price": 1250000.00,
  "status": "ACTIVE",
  "inStock": true,
  "createdAt": "2025-12-01T10:30:00",
  "updatedAt": "2025-12-01T10:30:00"
}
```

**Validation Rules** (Quy tắc kiểm tra):
- ✅ Tên phụ tùng: 3-255 ký tự
- ✅ Mã SKU: 5-100 ký tự, chỉ chứa chữ cái in hoa, số, và dấu gạch ngang
- ✅ Số lượng: >= 0
- ✅ Giá: > 0, tối đa 8 chữ số nguyên, 2 chữ số thập phân

---

### 2️⃣ Xem danh sách phụ tùng (List All Parts)

**Endpoint**: `GET /api/spare-parts/all`

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "partName": "Bơm nước Vento",
    "sku": "MP-VENTO-PUMP-001",
    "quantityInStock": 50,
    "price": 1250000.00,
    "status": "ACTIVE",
    "inStock": true
  },
  {
    "id": 2,
    "partName": "Bộ piston Vento",
    "sku": "MP-VENTO-PISTON-001",
    "quantityInStock": 0,
    "price": 850000.00,
    "status": "OUT_OF_STOCK",
    "inStock": false
  }
]
```

---

### 3️⃣ Kiểm tra tồn kho (Check Inventory)

**Endpoint**: `POST /api/spare-parts/check-inventory`

**Request Body**:
```json
{
  "partId": 1,
  "requiredQuantity": 20
}
```

**Response - Sufficient Stock (200 OK)**:
```json
{
  "partId": 1,
  "partName": "Bơm nước Vento",
  "sku": "MP-VENTO-PUMP-001",
  "currentQuantity": 50,
  "requiredQuantity": 20,
  "available": true,
  "insufficientBy": null
}
```

**Response - Insufficient Stock (200 OK)**:
```json
{
  "partId": 1,
  "partName": "Bơm nước Vento",
  "sku": "MP-VENTO-PUMP-001",
  "currentQuantity": 15,
  "requiredQuantity": 20,
  "available": false,
  "insufficientBy": 5
}
```

---

### 4️⃣ Kiểm tra tồn kho hàng loạt (Batch Inventory Check)

**Endpoint**: `POST /api/spare-parts/check-inventory-batch`

**Request Body**:
```json
[
  {
    "partId": 1,
    "requiredQuantity": 20
  },
  {
    "partId": 2,
    "requiredQuantity": 10
  }
]
```

**Response (200 OK)**:
```json
[
  {
    "partId": 1,
    "partName": "Bơm nước Vento",
    "available": true,
    "insufficientBy": null
  },
  {
    "partId": 2,
    "partName": "Bộ piston Vento",
    "available": false,
    "insufficientBy": 10
  }
]
```

---

### 5️⃣ Cập nhật số lượng tồn kho (Adjust Inventory)

**Endpoint**: `PATCH /api/spare-parts/{id}/adjust-inventory`

**Request Body**:
```json
{
  "quantityChange": -5,
  "reason": "DAMAGE",
  "notes": "Hư do vận chuyển"
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "partName": "Bơm nước Vento",
  "quantityInStock": 45,
  "status": "ACTIVE",
  "updatedAt": "2025-12-01T11:00:00"
}
```

**Quantity Change Types**:
- ✅ Positive: Nhập hàng mới, khiếu nại, sửa chữa (RESTOCK, CORRECTION)
- ✅ Negative: Sử dụng, hư hỏng, mất (USAGE, DAMAGE, LOSS)

---

### 6️⃣ Sử dụng phụ tùng cho dịch vụ (Apply Parts to Service Order)

**Endpoint**: `POST /api/spare-parts/apply-to-service-order`

**Request Body**:
```json
{
  "serviceOrderId": 100,
  "items": [
    {
      "partId": 1,
      "quantityUsed": 2,
      "costIncurred": 2500000.00
    },
    {
      "partId": 3,
      "quantityUsed": 1,
      "costIncurred": 500000.00
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "message": "Phụ tùng đã được sử dụng thành công",
  "totalCost": 3000000.00,
  "parts": [
    {
      "id": 1,
      "partName": "Bơm nước Vento",
      "quantityInStock": 48,
      "status": "ACTIVE"
    },
    {
      "id": 3,
      "partName": "Dây truyền Vento",
      "quantityInStock": 4,
      "status": "LOW_STOCK"
    }
  ]
}
```

---

### 7️⃣ Xem phụ tùng tồn kho thấp (Low Stock Alert)

**Endpoint**: `GET /api/spare-parts/inventory/low-stock?threshold=10`

**Response (200 OK)**:
```json
[
  {
    "id": 2,
    "partName": "Bộ piston Vento",
    "sku": "MP-VENTO-PISTON-001",
    "quantityInStock": 5,
    "price": 850000.00,
    "status": "OUT_OF_STOCK"
  },
  {
    "id": 3,
    "partName": "Dây truyền Vento",
    "sku": "MP-VENTO-BELT-001",
    "quantityInStock": 8,
    "price": 500000.00,
    "status": "ACTIVE"
  }
]
```

---

## 📋 Error Codes & Solutions (Mã Lỗi & Giải Pháp)

### 400 Bad Request - Validation Error

**Error Response**:
```json
{
  "status": 400,
  "message": "Lỗi xác thực dữ liệu",
  "errors": {
    "sku": "Mã SKU chỉ chứa chữ cái in hoa, số và dấu gạch ngang",
    "price": "Giá phải lớn hơn 0"
  }
}
```

**Solutions**:
- ✅ SKU chỉ được dùng chữ cái IN HOA, số (0-9), và dấu gạch ngang (-)
- ✅ Tên phụ tùng phải 3-255 ký tự
- ✅ Số lượng phải >= 0
- ✅ Giá phải > 0

---

### 404 Not Found

**Error Response**:
```json
{
  "status": 404,
  "message": "Không tìm thấy phụ tùng với ID: 999"
}
```

**Solutions**:
- ✅ Kiểm tra ID phụ tùng có đúng không
- ✅ Phụ tùng có thể đã bị xóa (DISCONTINUED)
- ✅ Sử dụng endpoint `/api/spare-parts/all` để xem danh sách

---

### 409 Conflict - Duplicate SKU

**Error Response**:
```json
{
  "status": 409,
  "message": "Mã SKU 'MP-VENTO-PUMP-001' đã tồn tại trong hệ thống"
}
```

**Solutions**:
- ✅ Mã SKU phải unique (duy nhất)
- ✅ Sử dụng mã khác hoặc thêm suffix (-001, -002, etc.)

---

### 400 Bad Request - Insufficient Inventory

**Error Response**:
```json
{
  "status": 400,
  "message": "Số lượng tồn kho không đủ",
  "details": {
    "partId": 1,
    "partName": "Bơm nước Vento",
    "requiredQuantity": 50,
    "currentQuantity": 30,
    "insufficientBy": 20
  }
}
```

**Solutions**:
- ✅ Kiểm tra lại số lượng yêu cầu
- ✅ Xem danh sách low stock: `GET /api/spare-parts/inventory/low-stock`
- ✅ Điều chỉnh số lượng: `PATCH /api/spare-parts/{id}/adjust-inventory`

---

## 🔍 Search Operations (Tìm Kiếm)

### Search by Name (Tìm theo tên)

**Endpoint**: `GET /api/spare-parts/search/name?query=bơm`

**Response**:
```json
[
  {
    "id": 1,
    "partName": "Bơm nước Vento",
    "sku": "MP-VENTO-PUMP-001"
  }
]
```

---

### Search by SKU (Tìm theo mã)

**Endpoint**: `GET /api/spare-parts/search/sku?query=VENTO-PUMP`

**Response**:
```json
[
  {
    "id": 1,
    "partName": "Bơm nước Vento",
    "sku": "MP-VENTO-PUMP-001"
  }
]
```

---

## 📊 Status Values (Trạng Thái)

| Status | Ý Nghĩa | Khi Dùng |
|--------|---------|----------|
| **ACTIVE** | Đang kinh doanh | Phụ tùng bình thường có hàng |
| **INACTIVE** | Ngừng kinh doanh tạm thời | Phụ tùng tạm không bán |
| **DISCONTINUED** | Ngừng kinh doanh vĩnh viễn | Phụ tùng đã bị xóa logic |
| **OUT_OF_STOCK** | Hết hàng | Tự động khi số lượng = 0 |

---

## 🔐 Roles & Permissions (Vai Trò & Quyền Hạn)

```
┌─────────────────┬──────────┬──────────┬──────────┬────────────┬────────┐
│ Endpoint        │ CUSTOMER │ TECH     │ ADVISOR  │ BUSINESS   │ ADMIN  │
├─────────────────┼──────────┼──────────┼──────────┼────────────┼────────┤
│ POST /create    │    ❌    │    ❌    │    ❌    │     ✅     │   ✅   │
│ GET /{id}       │    ✅    │    ✅    │    ✅    │     ✅     │   ✅   │
│ PUT /{id}       │    ❌    │    ❌    │    ❌    │     ✅     │   ✅   │
│ DELETE /{id}    │    ❌    │    ❌    │    ❌    │     ✅     │   ✅   │
│ PATCH /adjust   │    ❌    │    ✅    │    ❌    │     ✅     │   ✅   │
│ POST /apply     │    ❌    │    ✅    │    ✅    │     ✅     │   ✅   │
│ GET /low-stock  │    ❌    │    ❌    │    ✅    │     ✅     │   ✅   │
└─────────────────┴──────────┴──────────┴──────────┴────────────┴────────┘
```

---

## 💾 Database Schema (Quick View)

### Parts Table
```sql
CREATE TABLE parts (
  part_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  part_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  quantity_in_stock INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('ACTIVE','INACTIVE','DISCONTINUED','OUT_OF_STOCK'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing Checklist (Danh Sách Kiểm Tra)

### Before Going to Production
- [ ] Create a test part with valid SKU
- [ ] Verify part is created with ACTIVE status
- [ ] Check inventory with sufficient quantity
- [ ] Check inventory with insufficient quantity
- [ ] Update part information
- [ ] Adjust inventory (increase and decrease)
- [ ] Apply parts to service order
- [ ] Verify low stock alerts work
- [ ] Search by name and SKU
- [ ] Verify error messages are clear
- [ ] Test with different user roles
- [ ] Verify JWT authentication works
- [ ] Test batch inventory check
- [ ] Verify soft delete (status = DISCONTINUED)
- [ ] Test concurrent operations

---

## 🚀 Quick Start Commands (Lệnh Nhanh)

### Using cURL

**1. Get JWT Token** (Lấy token JWT):
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

**2. Create Part** (Tạo phụ tùng):
```bash
curl -X POST http://localhost:8080/api/spare-parts/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partName": "Bơm nước Vento",
    "sku": "MP-VENTO-PUMP-001",
    "quantityInStock": 50,
    "price": 1250000.00
  }'
```

**3. Check Inventory** (Kiểm tra tồn kho):
```bash
curl -X POST http://localhost:8080/api/spare-parts/check-inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partId": 1,
    "requiredQuantity": 20
  }'
```

**4. List All Parts** (Xem tất cả phụ tùng):
```bash
curl -X GET http://localhost:8080/api/spare-parts/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Complete API Reference

### All Endpoints Summary

| # | Method | Endpoint | Purpose | Role |
|---|--------|----------|---------|------|
| 1 | POST | `/api/spare-parts/create` | Tạo phụ tùng | ADMIN, BUSINESS_MANAGER |
| 2 | GET | `/api/spare-parts/{id}` | Xem chi tiết | Authenticated |
| 3 | GET | `/api/spare-parts/sku/{sku}` | Xem theo mã SKU | Authenticated |
| 4 | GET | `/api/spare-parts/all` | Xem tất cả | Authenticated |
| 5 | GET | `/api/spare-parts/active` | Xem phụ tùng active | Authenticated |
| 6 | PUT | `/api/spare-parts/{id}` | Cập nhật | ADMIN, BUSINESS_MANAGER |
| 7 | DELETE | `/api/spare-parts/{id}` | Xóa (soft delete) | ADMIN, BUSINESS_MANAGER |
| 8 | GET | `/api/spare-parts/search/name?query=...` | Tìm theo tên | Authenticated |
| 9 | GET | `/api/spare-parts/search/sku?query=...` | Tìm theo mã | Authenticated |
| 10 | POST | `/api/spare-parts/check-inventory` | Kiểm tra 1 phụ tùng | Authenticated |
| 11 | POST | `/api/spare-parts/check-inventory-batch` | Kiểm tra hàng loạt | Authenticated |
| 12 | PATCH | `/api/spare-parts/{id}/adjust-inventory` | Điều chỉnh tồn kho | ADMIN, BUSINESS_MANAGER, TECHNICIAN |
| 13 | POST | `/api/spare-parts/apply-to-service-order` | Sử dụng cho dịch vụ | SERVICE_ADVISOR, TECHNICIAN |
| 14 | GET | `/api/spare-parts/inventory/low-stock?threshold=10` | Xem hàng tồn kho thấp | ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR |
| 15 | GET | `/api/spare-parts/inventory/out-of-stock` | Xem hàng hết | ADMIN, BUSINESS_MANAGER |
| 16 | GET | `/api/spare-parts/reports/inventory` | Báo cáo tồn kho | ADMIN, BUSINESS_MANAGER |

---

## 🎓 Learning Path

### Beginner (30 minutes)
1. Read this quick reference
2. Test basic CRUD operations
3. Check inventory examples

### Intermediate (2 hours)
1. Read SPARE_PARTS_TECHNICAL_SPEC.md
2. Understand database schema
3. Learn all validation rules

### Advanced (5 hours)
1. Read SPARE_PARTS_IMPLEMENTATION_GUIDE.md
2. Study transaction handling
3. Review error scenarios
4. Test edge cases

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "Invalid SKU format"  
**Solution**: Use only uppercase letters, numbers, and hyphens (e.g., `MP-VENTO-001`)

**Issue**: "Part not found"  
**Solution**: Verify part ID exists using `GET /api/spare-parts/all`

**Issue**: "Insufficient inventory"  
**Solution**: Adjust inventory first using `PATCH /adjust-inventory`

**Issue**: "Unauthorized (401)"  
**Solution**: Get a new JWT token from `/api/auth/login`

**Issue**: "Forbidden (403)"  
**Solution**: Check your user role, may need BUSINESS_MANAGER or ADMIN role

---

**Version**: 1.0  
**Status**: Production Ready ✅  
**Last Updated**: December 1, 2025

