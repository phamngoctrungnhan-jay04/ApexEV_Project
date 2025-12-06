# HƯỚNG DẪN SỬ DỤNG TÍNH NĂNG THEO DÕI CHECKLIST

## MỤC ĐÍCH
Cho phép **Customer** theo dõi chi tiết quy trình kiểm tra xe của **Technician** trong thời gian thực (real-time).

---

## TÍNH NĂNG

### **1. Xem Timeline Quy Trình**
Customer có thể xem toàn bộ quy trình bảo dưỡng gồm 7 bước:
1. **Tiếp nhận** - Xe đã được tiếp nhận
2. **Kiểm tra** - Đang kiểm tra tình trạng xe ⭐ **(CÓ CHECKLIST)**
3. **Báo giá** - Chuẩn bị báo giá phụ tùng (nếu có)
4. **Chờ phụ tùng** - Chờ phụ tùng về kho (nếu chưa có sẵn)
5. **Đang thực hiện** - Thay phụ tùng và bảo dưỡng
6. **Hoàn thành** - Sẵn sàng thanh toán
7. **Đã giao xe** - Đã thanh toán và nhận xe

### **2. Xem Checklist Chi Tiết (Bước 2: Kiểm tra)**
Khi ServiceOrder ở trạng thái **INSPECTION**, Customer có thể:
- **Click vào bước "Kiểm tra"** trong Timeline
- Timeline sẽ **mở rộng** và hiển thị danh sách Checklist
- Xem **từng mục kiểm tra** với:
  - ✅ **OK** - Mục kiểm tra đạt
  - ❌ **NOT_OK** - Mục có vấn đề/lỗi
  - ⏳ **NOT_CHECKED** - Chưa kiểm tra
- Xem **ghi chú** chi tiết của Technician
- Xem **hình ảnh bằng chứng** (nếu có)

### **3. Real-time Updates**
- Checklist **tự động cập nhật** mỗi 10 giây
- Không cần refresh trang thủ công
- Thấy được Technician đang kiểm tra mục nào

---

## HƯỚNG DẪN SỬ DỤNG

### **Bước 1: Vào trang History**
1. Đăng nhập với tài khoản Customer
2. Vào menu **"Lịch sử"** hoặc **"History"**
3. Xem danh sách các Appointment đã đặt

### **Bước 2: Click "Theo dõi"**
1. Tìm Appointment có trạng thái **"Đang kiểm tra"** hoặc các trạng thái khác của ServiceOrder
2. Click nút **"Theo dõi"** (màu xanh với icon 🚗)
3. Hệ thống sẽ chuyển đến trang **OrderTracking**

### **Bước 3: Xem Timeline**
1. Mặc định hiển thị tab **"Quy trình thực hiện"**
2. Xem các bước quy trình với:
   - **Bước đã hoàn thành**: Icon ✅ màu xanh
   - **Bước đang thực hiện**: Icon và text màu xanh, có badge "Đang thực hiện"
   - **Bước chưa đến**: Icon và text màu xám

### **Bước 4: Xem Checklist (Chỉ ở bước Kiểm tra)**
1. **Click vào bước "Kiểm tra"** trong Timeline
2. Timeline sẽ **mở rộng xuống** với animation mượt
3. Hiển thị:
   - **Tên checklist**: VD "Checklist Bảo dưỡng định kỳ"
   - **Thống kê**: Số lượng OK, Lỗi, Chờ
   - **Danh sách items**: Từng mục kiểm tra với:
     - Icon trạng thái (✅/❌/⏳)
     - Tên mục kiểm tra
     - Ghi chú của Technician (nếu có)
     - Link xem hình ảnh (nếu có)

### **Bước 5: Xem hình ảnh bằng chứng**
1. Nếu Technician upload hình ảnh → Có link **"Xem hình ảnh"** hoặc **"Hình ảnh"**
2. Click vào link → Mở hình ảnh trong tab mới
3. Xem chi tiết vấn đề Technician phát hiện

### **Bước 6: Thu gọn Checklist**
1. Click lại vào bước **"Kiểm tra"**
2. Checklist sẽ thu gọn lại

### **Bước 7: Xem tab "Kiểm tra chi tiết" (Tùy chọn)**
1. Click tab **"Kiểm tra chi tiết"** ở đầu trang
2. Xem toàn bộ Checklist với giao diện Accordion
3. Click vào từng checklist để mở rộng
4. Xem danh sách items dạng lưới (grid layout)

---

## GHI CHÚ QUAN TRỌNG

### **⚠️ Khi nào có thể xem Checklist?**
- **Chỉ khi ServiceOrder ở trạng thái `INSPECTION`**
- Nếu chưa có Technician tạo Checklist → Hiển thị "Chưa có dữ liệu kiểm tra"
- Khi chuyển sang bước khác (QUOTING, IN_PROGRESS,...) → Checklist không còn hiển thị trong Timeline (nhưng vẫn lưu trong lịch sử)

### **✅ Lợi ích của tính năng:**
1. **Minh bạch**: Customer biết chính xác Technician đang làm gì
2. **Yên tâm**: Thấy được từng mục kiểm tra, hình ảnh bằng chứng
3. **Tiết kiệm thời gian**: Không cần gọi điện hỏi tiến độ
4. **Chuyên nghiệp**: Nâng cao trải nghiệm dịch vụ

### **📱 Responsive:**
- Giao diện tối ưu cho cả Desktop và Mobile
- Trên Mobile: Checklist items tự động điều chỉnh layout

### **🔄 Auto-refresh:**
- Checklist tự động cập nhật mỗi 10 giây
- Console log sẽ hiển thị: `Fetching checklists for orderId: ...`

---

## VÍ DỤ CHECKLIST

```
📋 Checklist Bảo dưỡng định kỳ 10,000 km
   ✅ 5 OK   ❌ 2 Lỗi   ⏳ 3 Chờ

   ✅ Kiểm tra mức dầu phanh
      Ghi chú: Dầu phanh còn đủ, chất lượng tốt

   ❌ Kiểm tra lốp xe
      Ghi chú: Lốp trước trái mòn 70%, cần thay
      🖼️ Xem hình ảnh

   ✅ Kiểm tra đèn chiếu sáng
      Ghi chú: Đèn hoạt động bình thường

   ❌ Kiểm tra má phanh
      Ghi chú: Má phanh sau còn 20%, khuyến nghị thay
      🖼️ Xem hình ảnh

   ⏳ Kiểm tra hệ thống làm mát
   ⏳ Kiểm tra bộ lọc không khí
   ⏳ Kiểm tra hệ thống treo
```

---

## TROUBLESHOOTING (XỬ LÝ SỰ CỐ)

### **❓ Không thấy nút "Theo dõi"?**
- Kiểm tra Appointment phải có `serviceOrderId`
- Chỉ hiển thị khi Appointment ở trạng thái `IN_SERVICE` trở đi

### **❓ Click vào "Kiểm tra" nhưng không mở ra?**
- Kiểm tra Console log: `Cannot expand - checklists.length: 0`
- Có nghĩa là chưa có Checklist → Đợi Technician tạo

### **❓ Không thấy hình ảnh?**
- Kiểm tra Technician có upload hình ảnh không (evidenceUrl)
- Nếu có link nhưng không hiển thị → Kiểm tra S3 bucket permissions

### **❓ Checklist không tự động cập nhật?**
- Kiểm tra Console log: `Fetching checklists...` mỗi 10 giây
- Nếu không có log → Kiểm tra useEffect trong OrderTracking.jsx
- Clear cache và hard refresh (Ctrl + Shift + R)

---

## TECHNICAL INFO (DÀNH CHO DEVELOPER)

### **Files liên quan:**
- `OrderTracking.jsx` - Trang chính, fetch checklists
- `OrderTimeline.jsx` - Component Timeline, expandable checklist
- `OrderTimeline.css` - Styling cho expansion
- `checklistService.js` - API service fetch checklist

### **API Endpoint:**
```
GET /api/checklist/service-order/{serviceOrderId}
```

### **Response format:**
```json
[
  {
    "checklistId": 1,
    "templateName": "Checklist Bảo dưỡng định kỳ",
    "items": [
      {
        "itemName": "Kiểm tra mức dầu phanh",
        "status": "OK",
        "notes": "Dầu phanh còn đủ",
        "evidenceUrl": "https://s3.amazonaws.com/..."
      },
      {
        "itemName": "Kiểm tra lốp xe",
        "status": "NOT_OK",
        "notes": "Lốp mòn 70%",
        "evidenceUrl": "https://s3.amazonaws.com/..."
      }
    ]
  }
]
```

### **Auto-refresh logic:**
```javascript
useEffect(() => {
  fetchChecklists();
  const interval = setInterval(() => {
    fetchChecklists();
  }, 10000); // 10 seconds
  return () => clearInterval(interval);
}, [orderId]);
```

---

**Tài liệu được tạo bởi: APEX EV Development Team**  
**Ngày cập nhật: 06/12/2025**  
**Version: 1.0**
