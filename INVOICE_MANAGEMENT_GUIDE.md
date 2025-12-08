# 📋 Hướng dẫn sử dụng tính năng Invoice Management

## 🎯 Tổng quan
Tính năng **Invoice Management** cho phép **Service Advisor** quản lý và xuất hóa đơn cho các đơn hàng đã hoàn tất.

---

## 🔧 Các thành phần đã tạo

### 📁 Frontend
1. **InvoiceManagement.jsx** - Trang chính quản lý hóa đơn
   - Đường dẫn: `/advisor/invoices`
   - Hiển thị danh sách đơn hàng READY_FOR_INVOICE và COMPLETED
   - Các tính năng:
     - Tìm kiếm theo mã đơn, tên khách, biển số
     - Lọc theo trạng thái
     - Tạo hóa đơn
     - Gửi email
     - Tải PDF (chưa implement)

2. **invoiceService.js** - Service gọi API
   - `getOrdersReadyForInvoice()` - Lấy danh sách đơn hàng
   - `createInvoice(orderId, data)` - Tạo hóa đơn
   - `sendInvoiceEmail(invoiceId)` - Gửi email
   - `downloadInvoicePDF(invoiceId)` - Tải PDF

3. **InvoiceManagement.css** - Styling tuân thủ APEX Modern UI

### 📁 Backend
1. **ServiceOrderResponse.java** - DTO cho danh sách orders
   - Package: `com.apexev.dto.response.orderResponse`
   
2. **InvoiceService.java** (cập nhật)
   - Thêm method: `getOrdersReadyForInvoice()`

3. **InvoiceServiceImpl.java** (cập nhật)
   - Implement logic lấy orders với status READY_FOR_INVOICE hoặc COMPLETED
   - Map thủ công sang ServiceOrderResponse để tránh Lazy Loading

4. **InvoiceController.java** (cập nhật)
   - Endpoint mới: `GET /api/invoices/ready-orders`
   - Yêu cầu role: `SERVICE_ADVISOR`

5. **ServiceOrderRepository.java** (cập nhật)
   - Thêm method: `findByStatusIn(List<OrderStatus> statuses)`

---

## 🔄 Quy trình hoạt động

### 1️⃣ Technician hoàn tất công việc
```
Technician bấm "Hoàn tất kiểm tra" 
   ↓
ServiceOrder.status = READY_FOR_INVOICE
   ↓
Advisor nhận được đơn hàng trong Invoice Management
```

### 2️⃣ Advisor tạo hóa đơn
```
Advisor vào /advisor/invoices
   ↓
Chọn đơn hàng có status READY_FOR_INVOICE
   ↓
Bấm nút "Tạo hóa đơn" (icon FiFileText)
   ↓
Backend tạo Invoice:
   - Tính tổng tiền từ các OrderItem đã APPROVED
   - Đổi status ServiceOrder → COMPLETED
   - Gửi notification cho Customer
   - Gửi email xác nhận
   ↓
Invoice được tạo với status PENDING
```

### 3️⃣ Gửi email cho khách hàng
```
Advisor bấm nút "Gửi email" (icon FiMail)
   ↓
Backend gửi email qua SNS/SES
   ↓
Thông báo "Đã gửi hóa đơn qua email!"
```

---

## 📊 Các trạng thái (Status)

### ServiceOrder Status
- `READY_FOR_INVOICE` - Chờ xuất hóa đơn (màu vàng)
- `COMPLETED` - Đã hoàn tất (màu xám)

### Invoice Status
- `PENDING` - Chờ thanh toán
- `PAID` - Đã thanh toán
- `OVERDUE` - Quá hạn

---

## 🎨 Giao diện

### Header với Glassmorphism
```css
background: linear-gradient(135deg, #338AF3 0%, #005CF0 100%);
backdrop-filter: blur(12px);
box-shadow: 0 4px 12px rgba(51, 138, 243, 0.25);
```

### Status Badges
- **READY_FOR_INVOICE**: Gradient vàng
- **INVOICE_CREATED**: Gradient xanh
- **INVOICE_SENT**: Gradient xanh lá
- **COMPLETED**: Gradient xám

### Action Buttons
- **Xem chi tiết** (FiEye): Màu xanh primary
- **Tạo hóa đơn** (FiFileText): Màu xanh lá
- **Gửi email** (FiMail): Màu vàng
- **Tải PDF** (FiDownload): Màu xám

---

## 🔐 Quyền truy cập
- **SERVICE_ADVISOR**: Full quyền (xem, tạo, gửi email)
- **BUSINESS_MANAGER**: Xem và mark as paid
- **CUSTOMER**: Chỉ xem hóa đơn của mình (qua OrderTracking)

---

## 🚀 Các bước triển khai

### 1. Restart Backend
```bash
cd C:\Project OJT\ApexEV_BE\apexev
./mvnw spring-boot:run
```

### 2. Kiểm tra Frontend đã import đúng
- File `App.jsx` đã import `InvoiceManagement`
- Route `/advisor/invoices` đã được thêm
- AdvisorSidebar đã có menu "Xuất hóa đơn"

### 3. Test workflow
1. Login với role SERVICE_ADVISOR
2. Vào `/advisor/invoices`
3. Kiểm tra danh sách đơn hàng hiển thị
4. Thử tạo hóa đơn cho đơn có status READY_FOR_INVOICE
5. Kiểm tra email đã gửi thành công

---

## 🐛 Troubleshooting

### Lỗi: "No matching orders found"
- Kiểm tra database có ServiceOrder nào với status READY_FOR_INVOICE không
- Chạy query: `SELECT * FROM service_orders WHERE status = 'READY_FOR_INVOICE';`

### Lỗi: "Access Denied"
- Kiểm tra user đang login có role SERVICE_ADVISOR không
- Check token trong localStorage có hợp lệ không

### Lỗi: "Cannot read property of null"
- Kiểm tra tất cả relations trong Entity đã có `@JsonIgnore` chưa
- Restart backend để áp dụng code mới

---

## 📝 TODO (Chức năng mở rộng)

### Ưu tiên cao
- [ ] Implement chức năng tải PDF hóa đơn (JasperReports hoặc iText)
- [ ] Thêm preview hóa đơn trước khi gửi email
- [ ] Lưu trữ PDF hóa đơn lên S3

### Ưu tiên trung bình
- [ ] Thêm filter theo khoảng thời gian (date range picker)
- [ ] Export danh sách đơn hàng ra Excel
- [ ] In hóa đơn trực tiếp từ browser

### Ưu tiên thấp
- [ ] Dashboard thống kê doanh thu từ hóa đơn
- [ ] Gửi reminder email cho hóa đơn quá hạn
- [ ] Multi-language support cho email template

---

## 📞 Liên hệ
Nếu gặp vấn đề, vui lòng báo cáo qua:
- GitHub Issues
- Email support team
- Slack channel #apex-ev-support
