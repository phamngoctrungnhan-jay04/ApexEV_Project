# QUY TRÌNH NGHIỆP VỤ APEX EV - BUSINESS FLOW

## TỔNG QUAN HỆ THỐNG

Hệ thống quản lý bảo dưỡng xe điện APEX EV có 3 vai trò chính:
- **Customer**: Khách hàng đặt lịch và theo dõi
- **Advisor**: Cố vấn dịch vụ - tiếp nhận và điều phối
- **Technician**: Kỹ thuật viên - thực hiện bảo dưỡng

---

## 1. QUY TRÌNH KỸ THUẬT VIÊN (TECHNICIAN FLOW)

### **Bước 1: Tiếp nhận xe (RECEPTION)**
- Kỹ thuật viên nhận xe được phân công từ Advisor
- **Trạng thái**: `CONFIRMED` (Appointment) → `RECEPTION` (ServiceOrder)
- **Công việc**:
  - Ghi nhận thông tin xe: Kilomet hiện tại, tình trạng bên ngoài
  - Chụp ảnh xe trước khi tiếp nhận
  - Xác nhận với khách hàng các vấn đề đã biết
- **Hành động tiếp theo**: Click **"Bắt đầu kiểm tra xe"** → Chuyển sang INSPECTION

### **Bước 2: Kiểm tra xe (INSPECTION) ⭐ QUAN TRỌNG**
- **Trạng thái**: `RECEPTION` → `INSPECTION`
- **Công việc**:
  - **Tạo Checklist** theo Template của dịch vụ
  - **Kiểm tra từng mục** trong checklist:
    - ✅ **OK**: Mục kiểm tra đạt, không có vấn đề
    - ❌ **NOT_OK**: Mục có vấn đề, cần thay thế hoặc sửa chữa
    - ⏳ **NOT_CHECKED**: Chưa kiểm tra mục này
  - **Upload hình ảnh** bằng chứng cho các mục có vấn đề (NOT_OK)
  - **Ghi chú chi tiết** về tình trạng từng mục
  - 👁️ **Customer có thể theo dõi real-time** qua OrderTracking page
  
- **Phát hiện cần thay phụ tùng?**
  - ✅ **CÓ**: Click **"Chọn phụ tùng cần thay"** → Chọn parts → Click **"Hoàn tất kiểm tra"** → Chuyển sang `QUOTING`
  - ❌ **KHÔNG**: Click **"Hoàn tất kiểm tra"** → Chuyển thẳng sang `IN_PROGRESS`

### **Bước 3: Báo giá (QUOTING) - CHỈ KHI CẦN PHỤ TÙNG**
- **Trạng thái**: `INSPECTION` → `QUOTING` (chỉ khi có phụ tùng cần thay)
- **Công việc**:
  - Hệ thống tự động tạo **Quote** (Báo giá) từ danh sách phụ tùng đã chọn
  - **Gửi báo giá** đến Advisor
  - Advisor review và **gửi đến Customer** qua:
    - ✉️ Email notification
    - 🔔 In-app notification
- **Đợi phản hồi**:
  - ✅ Customer **Chấp nhận** → Advisor xác nhận
  - ❌ Customer **Từ chối** → Thảo luận lại hoặc hủy
  
- **Sau khi được duyệt**:
  - Click **"Xác nhận phụ tùng"**
  - Hệ thống hỏi: **"Phụ tùng đã có sẵn trong kho?"**
    - ✅ **YES** → Chuyển sang `IN_PROGRESS` (Bắt đầu thực hiện luôn)
    - ❌ **NO** → Chuyển sang `WAITING_FOR_PARTS` (Chờ phụ tùng về)

### **Bước 4: Chờ phụ tùng (WAITING_FOR_PARTS) - CHỈ KHI CHƯA CÓ SẴN**
- **Trạng thái**: `QUOTING` → `WAITING_FOR_PARTS` (chỉ khi phụ tùng chưa có sẵn)
- **Công việc**:
  - Advisor/Quản lý kho **đặt hàng phụ tùng**
  - Theo dõi tiến độ đặt hàng
  - **Thông báo Technician** khi phụ tùng về kho
  
- **Khi phụ tùng về**:
  - Advisor/Quản lý kho cập nhật trạng thái trong hệ thống
  - Technician nhận notification
  - Click **"Phụ tùng đã về"** → Chuyển sang `IN_PROGRESS`

### **Bước 5: Thực hiện bảo dưỡng (IN_PROGRESS)**
- **Trạng thái**: 
  - `INSPECTION` → `IN_PROGRESS` (nếu không cần phụ tùng)
  - `QUOTING` → `IN_PROGRESS` (nếu phụ tùng có sẵn)
  - `WAITING_FOR_PARTS` → `IN_PROGRESS` (khi phụ tùng đã về)
  
- **Công việc**:
  - **Thay thế phụ tùng** (nếu có)
  - **Thực hiện các công việc bảo dưỡng** theo dịch vụ
  - **Cập nhật checklist** (đánh dấu các mục đã hoàn thành)
  - **Chụp ảnh** sau khi hoàn thành (nếu cần)
  - **Ghi chú** công việc đã thực hiện chi tiết
  
- **Hoàn tất công việc**:
  - Click **"Hoàn thành công việc"**
  - Hệ thống kiểm tra:
    - ⚠️ Có mục checklist nào chưa hoàn thành không?
    - Hiển thị cảnh báo nếu có
  - Xác nhận → Chuyển sang `READY_FOR_INVOICE`

### **Bước 6: Hoàn thành (READY_FOR_INVOICE)**
- **Trạng thái**: `IN_PROGRESS` → `READY_FOR_INVOICE`
- **Công việc**:
  - Hệ thống tự động tạo **Invoice** (Hóa đơn) với:
    - 💼 Dịch vụ đã thực hiện
    - 🔧 Phụ tùng đã thay (nếu có)
    - 💰 Tổng chi phí
  - **Thông báo Customer và Advisor**:
    - ✉️ Email với Invoice PDF
    - 🔔 In-app notification
  - Xe **sẵn sàng giao** cho khách hàng

### **Bước 7: Giao xe (COMPLETED)**
- **Trạng thái**: `READY_FOR_INVOICE` → `COMPLETED`
- **Công việc**:
  - Advisor hoặc Receptionist **giao xe** cho Customer
  - Customer **thanh toán** theo Invoice
  - **Ký xác nhận** nhận xe
  - Advisor cập nhật trạng thái → `COMPLETED`
- **Kết thúc quy trình** ✅

---

## 2. QUY TRÌNH KHÁCH HÀNG (CUSTOMER FLOW)

### **Bước 1: Đặt lịch (Booking)**
- Customer đăng nhập hệ thống
- Chọn **xe** (từ danh sách xe đã đăng ký)
- Chọn **dịch vụ** bảo dưỡng (từ Service catalog)
- Chọn **ngày giờ** mong muốn
- Ghi chú yêu cầu đặc biệt (nếu có)
- **Tạo Appointment** với trạng thái `PENDING` (Chờ xác nhận)

### **Bước 2: Chờ Advisor duyệt**
- Advisor xem danh sách Appointment đang chờ
- **Duyệt** hoặc **Từ chối**:
  - ✅ Nếu duyệt → Chuyển `PENDING` → `CONFIRMED` (Đã xác nhận)
  - ❌ Nếu từ chối → Chuyển `PENDING` → `CANCELLED` (Đã hủy)
- **Phân công Technician** cho Appointment
- **Gửi email** xác nhận + **notification** cho Customer

### **Bước 3: Nhận thông báo xác nhận**
- Customer nhận email xác nhận
- Nhận notification trong hệ thống
- Xem chi tiết lịch hẹn tại trang **History**

### **Bước 4: Đến cửa hàng đúng giờ**
- Customer mang xe đến đúng ngày giờ đã hẹn
- Advisor/Technician tiếp nhận xe
- Appointment chuyển `CONFIRMED` → `IN_SERVICE` (Đang phục vụ)
- **ServiceOrder được tạo** với trạng thái `RECEPTION`

### **Bước 5: Theo dõi quy trình real-time**
- Customer vào trang **History** → Click **"Theo dõi"**
- Xem trạng thái hiện tại:
  - 🔵 `RECEPTION` - Tiếp nhận xe
  - 🔍 `INSPECTION` - Đang kiểm tra
  - 💰 `QUOTING` - Đang báo giá
  - ⏳ `WAITING_FOR_PARTS` - Chờ phụ tùng
  - 🔧 `IN_PROGRESS` - Đang thực hiện
  - ✅ `READY_FOR_INVOICE` - Hoàn thành
  - 🚗 `COMPLETED` - Đã giao xe

### **Bước 6: Xem Checklist real-time (Trong bước INSPECTION)**
- Khi trạng thái là `INSPECTION` → Customer có thể xem chi tiết:
  - Tab **"Quy trình thực hiện"** → Click vào bước **"Kiểm tra"**
  - Xem danh sách **Checklist items**:
    - ✅ Số mục OK
    - ❌ Số mục có lỗi
    - ⏳ Số mục chưa kiểm tra
  - Xem **hình ảnh bằng chứng** Technician upload
  - Xem **ghi chú** của Technician
  - **Tự động refresh** mỗi 10 giây

### **Bước 7: Nhận và duyệt báo giá (nếu có)**
- Nếu cần thay phụ tùng → Nhận **notification báo giá**
- Xem chi tiết:
  - Phụ tùng cần thay
  - Giá từng phụ tùng
  - Tổng chi phí dự kiến
- **Chấp nhận** hoặc **Từ chối** báo giá
- Nếu chấp nhận → Technician tiếp tục quy trình

### **Bước 8: Nhận thông báo hoàn thành**
- Khi trạng thái chuyển `READY_FOR_INVOICE` → Nhận notification
- Xem **Invoice** (Hóa đơn) chi tiết
- **Đặt lịch đến nhận xe** (nếu cần)

### **Bước 9: Thanh toán và nhận xe**
- Customer đến cửa hàng
- **Thanh toán** theo Invoice
- **Nhận xe** và kiểm tra
- Trạng thái chuyển `READY_FOR_INVOICE` → `COMPLETED` (Hoàn tất)
- Có thể **đánh giá** (Rating & Review) dịch vụ

---

## 3. QUY TRÌNH CỐ VẤN (ADVISOR FLOW)

### **Bước 1: Quản lý Appointment**
- Xem danh sách Appointment `PENDING` (Chờ duyệt)
- Review thông tin:
  - Thông tin Customer
  - Xe và dịch vụ yêu cầu
  - Thời gian mong muốn
- **Duyệt** hoặc **Từ chối**
- **Phân công Technician** phù hợp

### **Bước 2: Theo dõi ServiceOrder**
- Xem danh sách ServiceOrder đang thực hiện
- Theo dõi tiến độ từng order
- Hỗ trợ Technician nếu cần

### **Bước 3: Quản lý báo giá**
- Nhận báo giá từ Technician
- Review giá phụ tùng và chi phí
- **Gửi báo giá** đến Customer
- Đợi Customer phản hồi
- **Xác nhận** khi Customer chấp nhận

### **Bước 4: Quản lý phụ tùng**
- Kiểm tra tồn kho Parts
- Đặt hàng nếu thiếu
- **Thông báo Technician** khi phụ tùng về

### **Bước 5: Quản lý Invoice**
- Review Invoice do Technician tạo
- Xác nhận chi phí chính xác
- Gửi Invoice cho Customer
- Theo dõi thanh toán

### **Bước 6: Giao xe**
- Xác nhận Customer đã thanh toán
- Giao xe và giải thích công việc đã làm
- Chuyển trạng thái `COMPLETED`

---

## LUỒNG DỮ LIỆU (DATA FLOW)

### **Appointment (Lịch hẹn)**
Trạng thái Appointment:
1. `PENDING` - Chờ duyệt
2. `CONFIRMED` - Đã xác nhận
3. `IN_SERVICE` - Đang phục vụ (tạo ServiceOrder)
4. `COMPLETED` - Hoàn thành
5. `CANCELLED` - Đã hủy

### **ServiceOrder (Đơn bảo dưỡng)**
Trạng thái ServiceOrder (Chi tiết hơn):
1. `RECEPTION` - Tiếp nhận xe
2. `INSPECTION` - Đang kiểm tra (có Checklist)
3. `QUOTING` - Đang báo giá (nếu cần phụ tùng)
4. `WAITING_FOR_PARTS` - Chờ phụ tùng (nếu chưa có sẵn)
5. `IN_PROGRESS` - Đang thực hiện bảo dưỡng
6. `READY_FOR_INVOICE` - Hoàn thành, chờ thanh toán
7. `COMPLETED` - Đã thanh toán và giao xe
8. `CANCELLED` - Đã hủy

### **Checklist (Danh sách kiểm tra)**
- Mỗi ServiceOrder có thể có **nhiều Checklist**
- Mỗi Checklist dựa trên **Template** của dịch vụ
- Mỗi Checklist có nhiều **ChecklistItem** với:
  - `itemName`: Tên mục kiểm tra
  - `status`: OK / NOT_OK / NOT_CHECKED
  - `notes`: Ghi chú của Technician
  - `evidenceUrl`: Link hình ảnh bằng chứng

### **Invoice (Hóa đơn)**
- Được tạo khi ServiceOrder ở trạng thái `READY_FOR_INVOICE`
- Bao gồm:
  - Chi tiết dịch vụ
  - Chi tiết phụ tùng đã thay
  - Tổng chi phí
  - Trạng thái thanh toán

---

## NOTIFICATION (THÔNG BÁO)

### **Thông báo cho Customer:**
1. Appointment được **Duyệt** (CONFIRMED)
2. Appointment bị **Từ chối** (CANCELLED)
3. Xe đã được **Tiếp nhận** (RECEPTION)
4. Đang **Kiểm tra** xe (INSPECTION)
5. Có **Báo giá** cần duyệt (QUOTING)
6. Đang **Thực hiện** bảo dưỡng (IN_PROGRESS)
7. **Hoàn thành**, sẵn sàng thanh toán (READY_FOR_INVOICE)
8. Đã **Giao xe** (COMPLETED)

### **Thông báo cho Technician:**
1. Có Appointment mới được **Phân công**
2. Customer **Chấp nhận** báo giá
3. Phụ tùng đã **Về kho** (WAITING_FOR_PARTS → IN_PROGRESS)

### **Thông báo cho Advisor:**
1. Có Appointment mới **Chờ duyệt** (PENDING)
2. Technician gửi **Báo giá** (QUOTING)
3. ServiceOrder **Hoàn thành** (READY_FOR_INVOICE)

---

## TÓM TẮT QUY TRÌNH HOÀN CHỈNH

```
CUSTOMER                          ADVISOR                          TECHNICIAN
   |                                 |                                 |
   | 1. Đặt lịch (PENDING)           |                                 |
   |-------------------------------->|                                 |
   |                                 | 2. Duyệt + Phân công            |
   |                                 |-------------------------------->|
   | 3. Nhận email xác nhận (CONFIRMED)                                |
   |<--------------------------------|                                 |
   |                                 |                                 |
   | 4. Đến cửa hàng (IN_SERVICE)    |                                 |
   |------------------------------------------------>| 5. Tiếp nhận (RECEPTION)
   |                                 |                |                
   |                                 |                | 6. Kiểm tra (INSPECTION)
   | 7. Theo dõi checklist real-time |                | - Tạo checklist
   |<-----------------------------------------------------------------|
   |   (Xem ảnh, ghi chú)            |                | - Upload ảnh
   |                                 |                |
   |                                 |                | 8. Cần phụ tùng? (QUOTING)
   |                                 |<---------------|
   |                                 | 9. Gửi báo giá |
   | 10. Nhận báo giá                |--------------->|
   |<--------------------------------|                |
   | 11. Chấp nhận báo giá           |                |
   |-------------------------------->|                |
   |                                 | 12. Xác nhận   |
   |                                 |--------------->|
   |                                 |                | 13. Phụ tùng có sẵn?
   |                                 |                |     - Có: IN_PROGRESS
   |                                 |                |     - Không: WAITING_FOR_PARTS
   |                                 |                |
   |                                 |                | 14. Thực hiện (IN_PROGRESS)
   |                                 |                | - Thay phụ tùng
   |                                 |                | - Bảo dưỡng
   |                                 |                |
   |                                 |                | 15. Hoàn thành (READY_FOR_INVOICE)
   |                                 |<---------------|
   | 16. Nhận thông báo + Invoice    |                |
   |<--------------------------------|                |
   |                                 |                |
   | 17. Đến nhận xe + Thanh toán    |                |
   |-------------------------------->|                |
   |                                 | 18. Giao xe (COMPLETED)
   | 19. Nhận xe + Đánh giá          |--------------->|
   |<--------------------------------|                |
```

---

## LƯU Ý QUAN TRỌNG

### **Customer có thể theo dõi real-time:**
- ✅ Trạng thái ServiceOrder (RECEPTION → INSPECTION → ... → COMPLETED)
- ✅ Chi tiết Checklist trong bước INSPECTION:
  - Click vào bước "Kiểm tra" trong Timeline
  - Xem danh sách checklist items
  - Xem hình ảnh bằng chứng
  - Xem ghi chú của Technician
  - Auto-refresh mỗi 10 giây

### **Dual Status System:**
- **Appointment.status**: Trạng thái tổng quát (PENDING, CONFIRMED, IN_SERVICE, COMPLETED)
- **ServiceOrder.status**: Trạng thái chi tiết (RECEPTION, INSPECTION, QUOTING, ...)
- Customer xem **ServiceOrder.status** để theo dõi chi tiết hơn

### **Checklist chỉ tồn tại trong bước INSPECTION:**
- Được tạo khi Technician chuyển trạng thái sang INSPECTION
- Customer chỉ có thể xem checklist khi ServiceOrder ở trạng thái INSPECTION
- Sau khi chuyển sang bước khác (QUOTING, IN_PROGRESS), checklist vẫn lưu trong lịch sử nhưng không còn cập nhật

---

**Tài liệu được tạo bởi: APEX EV Development Team**  
**Ngày cập nhật: 06/12/2025**
