# Hệ Thống Quản Lý Tài Chính - APEX EV

## 📋 Tổng Quan
Trang **Quản lý Tài chính** dành cho role `BUSINESS_MANAGER` (Quản lý Kinh doanh) trong hệ thống APEX EV. Hệ thống cho phép quản lý toàn bộ hóa đơn, theo dõi doanh thu, và thống kê tài chính.

---

## 🚀 Các Tính Năng Chính

### 1. **Finance Dashboard** (`/manager/dashboard`)
- **Tổng quan tài chính**: Doanh thu, hóa đơn chờ thanh toán, quá hạn
- **Biểu đồ doanh thu**: Theo dõi doanh thu 6 tháng gần nhất
- **Hóa đơn gần đây**: Danh sách 5 hóa đơn mới nhất
- **Hóa đơn quá hạn**: Cảnh báo các hóa đơn chưa thanh toán đúng hạn
- **Thống kê nhanh**: Số lượng hóa đơn theo trạng thái

### 2. **Finance Invoices** (`/manager/invoices`)
- **Quản lý hóa đơn đầy đủ**: Xem, tìm kiếm, lọc hóa đơn
- **Bộ lọc nâng cao**:
  - Theo trạng thái: Đã thanh toán, Chờ thanh toán, Đã hủy
  - Theo ngày: Từ ngày - Đến ngày
  - Tìm kiếm: ID, tên khách hàng, biển số xe
- **Xác nhận thanh toán**: Chuyển trạng thái từ PENDING → PAID
- **Hủy hóa đơn**: Hủy hóa đơn với lý do cụ thể
- **Chi tiết hóa đơn**:
  - Thông tin khách hàng: Tên, email, số điện thoại
  - Thông tin xe: Biển số, hãng, model
  - Danh sách dịch vụ: Tên, số lượng, đơn giá, thành tiền
  - Trạng thái thanh toán & ngày hết hạn

### 3. **Manager Profile** (`/manager/profile`)
- **Thông tin cá nhân**: Họ tên, email, số điện thoại
- **Chỉnh sửa hồ sơ**: Cập nhật thông tin
- **Đổi mật khẩu**: Thay đổi mật khẩu bảo mật

---

## 🛠️ Cấu Trúc File

### **Backend** (Spring Boot)
```
apexev/src/main/java/com/apexev/
├── controller/financeAndReviews/
│   └── FinanceController.java         # API endpoints cho Finance Manager
├── service/
│   ├── service_Interface/
│   │   └── FinanceService.java        # Interface
│   └── serviceImpl/
│       └── FinanceServiceImpl.java    # Implementation
├── dto/response/financeAndReviewsResponse/
│   ├── FinanceStatisticsResponse.java # DTO thống kê
│   └── InvoiceDetailResponse.java     # DTO chi tiết hóa đơn
└── repository/financeAndReviews/
    └── InvoiceRepository.java         # JPA Repository
```

### **Frontend** (React)
```
ApexEV_FE/src/
├── pages/manager/
│   ├── FinanceDashboard.jsx           # Trang Dashboard
│   ├── FinanceDashboard.css
│   ├── FinanceInvoices.jsx            # Trang quản lý hóa đơn
│   ├── FinanceInvoices.css
│   ├── ManagerProfile.jsx             # Trang profile
│   └── ManagerProfile.css
├── components/layout/
│   ├── ManagerSidebar.jsx             # Sidebar Manager
│   ├── ManagerSidebar.css
│   ├── ManagerLayout.jsx              # Layout wrapper
│   └── ManagerLayout.css
├── services/
│   └── financeService.js              # API service
└── constants/
    └── routes.js                       # Routes Manager
```

---

## 📡 API Endpoints

### **Base URL**: `http://localhost:8081/api/finance`

#### 1. **Lấy tất cả hóa đơn**
```http
GET /api/finance/invoices?status={status}&startDate={date}&endDate={date}
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```
**Response**: `List<InvoiceDetailResponse>`

---

#### 2. **Lấy chi tiết hóa đơn**
```http
GET /api/finance/invoices/{invoiceId}
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```
**Response**: `InvoiceDetailResponse`

---

#### 3. **Lấy thống kê tài chính**
```http
GET /api/finance/statistics?startDate={date}&endDate={date}
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```
**Response**: `FinanceStatisticsResponse`
```json
{
  "totalRevenue": 50000000,
  "pendingAmount": 15000000,
  "overdueAmount": 3000000,
  "cancelledAmount": 2000000,
  "totalInvoices": 120,
  "paidInvoices": 85,
  "pendingInvoices": 30,
  "overdueInvoices": 5,
  "cancelledInvoices": 0,
  "averageInvoiceAmount": 500000,
  "revenueGrowth": 12.5,
  "invoiceGrowth": 8.3
}
```

---

#### 4. **Lấy thống kê theo tháng**
```http
GET /api/finance/statistics/monthly?months=6
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```
**Response**: `List<MonthlyRevenue>`

---

#### 5. **Xác nhận thanh toán**
```http
PATCH /api/finance/invoices/{invoiceId}/confirm-payment?paymentMethod=CASH
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN, SERVICE_ADVISOR
```
**Payment Methods**: `CASH`, `BANK_TRANSFER`, `CARD`

---

#### 6. **Hủy hóa đơn**
```http
PATCH /api/finance/invoices/{invoiceId}/cancel?reason={reason}
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```

---

#### 7. **Lấy hóa đơn quá hạn**
```http
GET /api/finance/invoices/overdue
Authorization: Bearer {token}
Role: BUSINESS_MANAGER, ADMIN
```

---

## 🎨 Thiết Kế UI (APEX Modern UI)

### **Color Palette**
- **Primary**: `#34c759` (Xanh lá - Tài chính)
- **Success**: `#34c759`
- **Danger**: `#EF4444`
- **Warning**: `#FFA726`
- **Background**: `#F8FAFC`
- **Text**: `#1F2937` (Chính), `#6B7280` (Phụ)

### **Visual Style**
- **Glassmorphism**: `backdrop-filter: blur(12px)` cho Sidebar
- **Shadows**: Bóng màu với `box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3)`
- **Border Radius**: `12px` - `20px`
- **Transitions**: `0.25s ease` cho hiệu ứng mượt mà

---

## 🔐 Quyền Truy Cập

### **Role BUSINESS_MANAGER** có quyền:
✅ Xem toàn bộ hóa đơn  
✅ Xem thống kê tài chính  
✅ Xác nhận thanh toán  
✅ Hủy hóa đơn  
✅ Xem chi tiết hóa đơn  

### **Role ADMIN** có quyền:
✅ Toàn bộ quyền của BUSINESS_MANAGER  

### **Role SERVICE_ADVISOR** có quyền:
✅ Xác nhận thanh toán (giới hạn)  

---

## 🧪 Hướng Dẫn Test

### **1. Test Backend (Spring Boot)**
```bash
# Start Backend
cd C:\Project OJT\ApexEV_BE\apexev
.\mvnw.cmd spring-boot:run
```

**Kiểm tra API bằng Postman hoặc Thunder Client**:
1. Login để lấy token:
   ```http
   POST http://localhost:8081/api/auth/login
   Body: { "email": "manager@apexev.com", "password": "123456" }
   ```
2. Gọi API Finance:
   ```http
   GET http://localhost:8081/api/finance/invoices
   Authorization: Bearer {token}
   ```

---

### **2. Test Frontend (React)**
```bash
# Start Frontend
cd C:\Project OJT\ApexEV_FE
npm run dev
```

**Đăng nhập với tài khoản Manager**:
- Email: `manager@apexev.com`
- Password: `123456`
- Role: `BUSINESS_MANAGER`

**Truy cập các trang**:
- Dashboard: `http://localhost:5173/manager/dashboard`
- Invoices: `http://localhost:5173/manager/invoices`
- Profile: `http://localhost:5173/manager/profile`

---

## ✅ Checklist Hoàn Thành

### Backend ✅
- [x] FinanceController.java - API endpoints
- [x] FinanceService.java - Interface
- [x] FinanceServiceImpl.java - Business logic
- [x] FinanceStatisticsResponse.java - DTO thống kê
- [x] InvoiceDetailResponse.java - DTO chi tiết

### Frontend ✅
- [x] ManagerSidebar.jsx & CSS - Navigation
- [x] ManagerLayout.jsx & CSS - Layout wrapper
- [x] FinanceDashboard.jsx & CSS - Dashboard
- [x] FinanceInvoices.jsx & CSS - Quản lý hóa đơn
- [x] ManagerProfile.jsx & CSS - Profile
- [x] financeService.js - API service
- [x] routes.js - Manager routes
- [x] App.jsx - Route configuration

---

## 🐛 Troubleshooting

### **Lỗi 403 Forbidden**
- Kiểm tra role trong token có phải `BUSINESS_MANAGER` không
- Kiểm tra `@PreAuthorize` trong Controller

### **Lỗi CORS**
- Đảm bảo Backend đã cấu hình CORS cho `http://localhost:5173`

### **Lỗi không load được dữ liệu**
- Kiểm tra Backend đã chạy chưa (port 8081)
- Kiểm tra token trong localStorage còn hợp lệ
- Mở DevTools → Network để xem response

### **Sidebar bị che nội dung**
- Kiểm tra `margin-left: 220px` trong `ManagerLayout.css`

---

## 📝 Notes

- **Tất cả giá trị tiền** đều dùng `BigDecimal` trong Backend
- **Format tiền tệ** dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- **Ngày tháng** dùng `LocalDateTime` trong Backend, format `dd/MM/yyyy HH:mm` trong Frontend
- **Trạng thái hóa đơn**: `PAID`, `PENDING`, `CANCELLED`
- **Hóa đơn quá hạn**: `dueDate < LocalDateTime.now() && status == PENDING`

---

## 🎯 Kết Luận

Hệ thống **Quản lý Tài chính** đã hoàn thành với đầy đủ chức năng:
- ✅ Dashboard trực quan với biểu đồ và thống kê
- ✅ Quản lý hóa đơn đầy đủ (CRUD)
- ✅ Xác nhận thanh toán và hủy hóa đơn
- ✅ Giao diện APEX Modern UI nhất quán
- ✅ Responsive trên mobile
- ✅ Backend API an toàn với Authorization

**Trang này sẵn sàng sử dụng cho role BUSINESS_MANAGER!** 🚀
