# 📋 HƯỚNG DẪN CHỨC NĂNG THEO DÕI QUY TRÌNH BẢO DƯỠNG VÀ HÓA ĐƠN
## Dự án: APEX EV - Hệ thống Đặt lịch Bảo dưỡng Xe Điện

---

## 🎯 **TỔNG QUAN CHỨC NĂNG**

Customer có thể:
1. ✅ Xem danh sách đơn hàng bảo dưỡng của mình
2. ✅ Theo dõi quy trình bảo dưỡng **REALTIME** (Timeline 7 bước)
3. ✅ Xem hóa đơn chi tiết bao gồm:
   - Dịch vụ đã chọn ban đầu
   - **Phụ tùng phát sinh** (được Advisor duyệt)
   - Tổng tiền thanh toán

---

## 📁 **CẤU TRÚC FILE ĐÃ TẠO**

### **1. Backend (Không cần tạo thêm - Đã có sẵn)**
```
✅ ServiceOrderController.java
   - GET /service-orders/my-history
   - GET /service-orders/{id}

✅ PartRequestService.java (Đã cập nhật)
   - Khi Advisor duyệt → Tự động tạo ServiceOrderItem
```

### **2. Frontend (Mới tạo)**

#### **Services Layer**
```
c:\Project OJT\ApexEV_FE\src\services\
├── customerOrderService.js ✅ (MỚI)
    ├── getMyOrders()
    ├── getOrderDetail(orderId)
    └── getOrderInvoice(orderId)
```

#### **Components**
```
c:\Project OJT\ApexEV_FE\src\components\features\
├── OrderTimeline.jsx ✅ (MỚI)
├── OrderTimeline.css ✅ (MỚI)
├── InvoicePreview.jsx ✅ (MỚI)
└── InvoicePreview.css ✅ (MỚI)
```

#### **Pages**
```
c:\Project OJT\ApexEV_FE\src\pages\customer\
├── OrderTracking.jsx ✅ (MỚI)
├── OrderTracking.css ✅ (MỚI)
└── History.jsx ✅ (ĐÃ CẬP NHẬT - Thêm nút "Theo dõi")
```

#### **Routes**
```
c:\Project OJT\ApexEV_FE\src\constants\
└── routes.js ✅ (ĐÃ CẬP NHẬT)
    └── ORDER_TRACKING: '/customer/order-tracking/:orderId'

c:\Project OJT\ApexEV_FE\src\
└── App.jsx ✅ (ĐÃ CẬP NHẬT)
    └── <Route path="order-tracking/:orderId" element={<OrderTracking />} />
```

---

## 🔄 **LUỒNG NGHIỆP VỤ CHI TIẾT**

### **A. Quy trình bảo dưỡng (7 bước)**

```
1. RECEPTION (Tiếp nhận)
   └─ Xe đã được tiếp nhận tại trung tâm
   
2. INSPECTION (Kiểm tra)
   └─ Kỹ thuật viên đang kiểm tra tình trạng xe
   
3. QUOTING (Báo giá)
   └─ Chuẩn bị báo giá cho khách hàng
   
4. WAITING_FOR_PARTS (Chờ phụ tùng) ⚠️
   └─ Cần phụ tùng thay thế, đang chờ Advisor duyệt
   
5. IN_PROGRESS (Đang thực hiện)
   └─ Kỹ thuật viên đang bảo dưỡng/sửa chữa
   
6. READY_FOR_INVOICE (Hoàn thành)
   └─ Đã hoàn thành, chờ thanh toán
   
7. COMPLETED (Đã giao xe)
   └─ Đã thanh toán và giao xe cho khách
```

### **B. Phụ tùng phát sinh**

```
Bước 1: Technician phát hiện cần phụ tùng
        └─ Tạo Part Request (Status: PENDING)

Bước 2: Advisor xem danh sách yêu cầu
        └─ Duyệt hoặc từ chối

Bước 3: Khi Advisor DUYỆT:
        ├─ ✅ Xuất kho (trừ số lượng tồn kho)
        ├─ ✅ Tạo ServiceOrderItem mới
        │   ├─ itemType = PART
        │   ├─ itemRefId = partId
        │   ├─ quantity = số lượng
        │   ├─ unitPrice = giá tại thời điểm duyệt
        │   └─ status = APPROVED
        └─ ✅ Ghi vào hóa đơn tự động

Bước 4: Customer xem hóa đơn
        └─ Thấy dịch vụ + phụ tùng phát sinh
```

---

## 🖥️ **GIAO DIỆN VÀ CHỨC NĂNG**

### **1. Trang History (Danh sách đơn hàng)**

**Đường dẫn:** `/customer/history`

**Chức năng:**
- Hiển thị danh sách tất cả đơn hàng
- Filter theo trạng thái (Tất cả, Đã hoàn thành, Chờ xác nhận, Đã hủy)
- Search theo mã đơn, xe, dịch vụ
- **2 nút hành động:**
  - 🟢 **"Theo dõi"** → Chuyển đến OrderTracking
  - 🔵 **"Chi tiết"** → Xem modal chi tiết

**Giao diện:**
```
┌─────────────────────────────────────────────────────┐
│  Lịch sử bảo dưỡng                                  │
│  ┌─────┬─────┬─────┬─────┬─────────┬──────────────┐│
│  │ Mã  │Ngày │ Xe  │Dịch │Trạng thái│   Thao tác   ││
│  │     │     │     │ vụ  │          │              ││
│  ├─────┼─────┼─────┼─────┼──────────┼──────────────┤│
│  │ #1  │12/6 │Tesla│Thay │IN_PROGRESS│[Theo dõi][Chi││
│  │     │     │Model│nhớt │          │     tiết]    ││
│  └─────┴─────┴─────┴─────┴──────────┴──────────────┘│
└─────────────────────────────────────────────────────┘
```

---

### **2. Trang OrderTracking (Theo dõi quy trình)**

**Đường dẫn:** `/customer/order-tracking/:orderId`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Quay lại     Theo dõi quy trình bảo dưỡng         │
│   Mã đơn: #123                    [Badge: IN_PROGRESS]│
├─────────────────────────────┬───────────────────────┤
│                             │  📄 Thông tin xe      │
│  ⏱️ QUY TRÌNH THỰC HIỆN      │  🚗 Tesla Model 3     │
│                             │  🏷️ 29A-12345          │
│  ✅ 1. Tiếp nhận             │                       │
│     Xe đã được tiếp nhận    │  👤 Thông tin liên hệ │
│                             │  📞 0987654321        │
│  ✅ 2. Kiểm tra              │  📧 customer@mail.com │
│     Đang kiểm tra tình trạng│                       │
│                             │  📅 Thời gian         │
│  🔵 3. Đang thực hiện        │  ⏰ Tiếp nhận: 12/6  │
│     Kỹ thuật viên đang...   │                       │
│     [Đang thực hiện]        │                       │
│                             │                       │
│  ⚪ 4. Hoàn thành            │                       │
│     Chờ thanh toán          │                       │
│                             │                       │
│  ⚪ 5. Đã giao xe            │                       │
│     Đã thanh toán và giao xe│                       │
├─────────────────────────────┴───────────────────────┤
│  💰 HÓA ĐƠN CHI TIẾT                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🔧 Dịch vụ bảo dưỡng                          │  │
│  │ ┌───────────┬────┬──────────┬───────────────┐│  │
│  │ │Dịch vụ    │ SL │Đơn giá   │  Thành tiền   ││  │
│  │ ├───────────┼────┼──────────┼───────────────┤│  │
│  │ │Thay nhớt  │ 1  │300,000đ  │  300,000đ     ││  │
│  │ │Kiểm tra   │ 1  │150,000đ  │  150,000đ     ││  │
│  │ └───────────┴────┴──────────┴───────────────┘│  │
│  │ Tổng dịch vụ: 450,000đ                       │  │
│  │                                               │  │
│  │ 📦 Phụ tùng thay thế (Phát sinh)             │  │
│  │ ┌───────────┬────┬──────────┬───────────────┐│  │
│  │ │Lốp xe     │ 2  │1,500,000│  3,000,000đ   ││  │
│  │ │Dầu nhớt   │ 4  │200,000đ │    800,000đ   ││  │
│  │ └───────────┴────┴──────────┴───────────────┘│  │
│  │ Tổng phụ tùng: 3,800,000đ                    │  │
│  │                                               │  │
│  │ 💵 TỔNG HÓA ĐƠN: 4,250,000đ                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  📝 GHI CHÚ                                          │
│  Yêu cầu của bạn: Xe bị rung lắc khi chạy nhanh... │
│  Ghi chú từ cố vấn: Đã kiểm tra, cần thay lốp...   │
│  Ghi chú từ KTV: Đã thay lốp mới, xe chạy ổn...    │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 **THIẾT KẾ APEX MODERN UI**

### **Màu sắc chính**
```css
Primary Blue: #338AF3 (Xanh chủ đạo)
Success Green: #34c759 (Hoàn thành)
Warning Yellow: #FFC107 (Chờ xử lý)
Danger Red: #EF4444 (Lỗi/Hủy)
Background: #f8fafc (Trắng xám nhạt)
```

### **Hiệu ứng đặc biệt**
- ✅ **Glassmorphism**: backdrop-filter: blur(12px)
- ✅ **Colored Shadows**: box-shadow với màu gradient
- ✅ **Border Radius**: 16px cho card, 12px cho button
- ✅ **Pulse Animation**: Timeline step đang active
- ✅ **Hover Scale**: transform: scale(1.04)

---

## 🔌 **API ENDPOINTS SỬ DỤNG**

### **Backend (Đã có sẵn)**
```
GET /service-orders/my-history
├─ Header: Authorization: Bearer {token}
└─ Response: List<ServiceOrderSummaryResponse>

GET /service-orders/{id}
├─ Header: Authorization: Bearer {token}
└─ Response: ServiceOrderDetailResponse
    ├─ orderId, status, createdAt, completedAt
    ├─ vehicleBrand, vehicleModel, licensePlate
    ├─ customerPhone, customerEmail
    ├─ orderItems[] → Dịch vụ + Phụ tùng
    │   ├─ itemType: SERVICE | PART
    │   ├─ itemRefId: ID của service hoặc part
    │   ├─ quantity, unitPrice
    │   └─ status: APPROVED
    └─ invoice { totalAmount, status, notes }
```

### **Frontend Service Functions**
```javascript
// customerOrderService.js
getMyOrders() → Danh sách đơn hàng
getOrderDetail(orderId) → Chi tiết 1 đơn
getOrderInvoice(orderId) → Hóa đơn (optional)
```

---

## ✅ **CHECKLIST KIỂM TRA**

### **Backend**
- [x] PartRequestService.java tự động tạo ServiceOrderItem khi duyệt
- [x] ServiceOrderController có endpoint /my-history
- [x] ServiceOrderController có endpoint /{id}
- [x] ServiceOrderItem có trường itemType, itemRefId
- [x] OrderStatus có đủ 7 trạng thái

### **Frontend**
- [x] customerOrderService.js có 3 functions
- [x] OrderTimeline.jsx hiển thị 7 bước
- [x] InvoicePreview.jsx tách dịch vụ và phụ tùng
- [x] OrderTracking.jsx kết hợp timeline + invoice
- [x] History.jsx có nút "Theo dõi" và "Chi tiết"
- [x] routes.js có ORDER_TRACKING route
- [x] App.jsx import OrderTracking và thêm route

---

## 🧪 **HƯỚNG DẪN TEST**

### **1. Kiểm tra Backend**
```bash
# 1. Compile backend
cd c:\Project OJT\ApexEV_BE\apexev
.\mvnw.cmd compile

# 2. Chạy backend
.\mvnw.cmd spring-boot:run
```

### **2. Test luồng phụ tùng phát sinh**
```
Bước 1: Login với tài khoản TECHNICIAN
Bước 2: Vào /technician/parts-request
Bước 3: Tạo yêu cầu phụ tùng cho đơn hàng
Bước 4: Login với tài khoản SERVICE_ADVISOR
Bước 5: Vào /advisor/parts-approval
Bước 6: Duyệt yêu cầu phụ tùng
        → Check database: ServiceOrderItem đã được tạo?
        → Check Part.quantityInStock đã trừ?
Bước 7: Login với tài khoản CUSTOMER
Bước 8: Vào /customer/history
Bước 9: Click "Theo dõi" → Kiểm tra timeline
Bước 10: Cuộn xuống xem hóa đơn
        → Có hiển thị phụ tùng với badge "Phát sinh"?
```

### **3. Test các trạng thái**
```sql
-- Thay đổi trạng thái đơn hàng trong DB để test timeline
UPDATE service_orders SET status = 'RECEPTION' WHERE order_id = 1;
UPDATE service_orders SET status = 'INSPECTION' WHERE order_id = 1;
UPDATE service_orders SET status = 'IN_PROGRESS' WHERE order_id = 1;
UPDATE service_orders SET status = 'COMPLETED' WHERE order_id = 1;
```

---

## 🐛 **TROUBLESHOOTING**

### **Lỗi thường gặp:**

**1. "Cannot read property 'orderItems' of undefined"**
```javascript
// Fix: Kiểm tra order có tồn tại trước khi truy cập
{order && order.orderItems && (
  <InvoicePreview orderItems={order.orderItems} />
)}
```

**2. "404 Not Found khi gọi API /service-orders/{id}"**
```
Nguyên nhân: User không phải chủ đơn hàng
Fix: Kiểm tra trong DB: service_orders.customer_id = user.userId
```

**3. "Timeline không hiển thị đúng trạng thái"**
```javascript
// Fix: Kiểm tra OrderStatus enum trong Backend
// Phải khớp với timeline steps trong OrderTimeline.jsx
```

**4. "Phụ tùng không hiển thị trong hóa đơn"**
```
Nguyên nhân: PartRequestService chưa tạo ServiceOrderItem
Fix: Kiểm tra code trong approveOrRejectPartRequest()
```

---

## 📚 **TÀI LIỆU THAM KHẢO**

- [Backend] `CHECKLIST_API_GUIDE.md`
- [Backend] `ServiceOrderController.java`
- [Backend] `PartRequestService.java`
- [Frontend] `MOBILE-RESPONSIVE.md`
- [Design] `.github/copilot-instructions.md` → APEX MODERN UI

---

## 🚀 **NÂNG CẤP TƯƠNG LAI**

### **Phase 2 - Thông báo realtime**
- WebSocket cho cập nhật trạng thái tự động
- Push notification khi trạng thái thay đổi

### **Phase 3 - Thanh toán online**
- Tích hợp VNPay/Momo
- QR Code thanh toán

### **Phase 4 - Chat support**
- Chat với Advisor trong trang OrderTracking
- Upload ảnh xe trực tiếp

### **Phase 5 - Export PDF**
- Tải hóa đơn dạng PDF
- In hóa đơn

---

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề, hãy kiểm tra:
1. Console log của Browser (F12)
2. Backend log trong terminal
3. Database bằng MySQL Workbench
4. Network tab để xem request/response

---

**Ngày tạo:** 06/12/2025  
**Phiên bản:** 1.0  
**Người tạo:** Lead Fullstack Developer - APEX EV Team
