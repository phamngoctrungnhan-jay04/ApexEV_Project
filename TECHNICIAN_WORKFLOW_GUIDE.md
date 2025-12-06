# HƯỚNG DẪN QUY TRÌNH LÀM VIỆC CHO KỸ THUẬT VIÊN

## MỤC LỤC
1. [Tổng quan quy trình](#tổng-quan-quy-trình)
2. [Chi tiết từng bước](#chi-tiết-từng-bước)
3. [Quản lý Checklist](#quản-lý-checklist)
4. [Quản lý phụ tùng](#quản-lý-phụ-tùng)
5. [Tips & Best Practices](#tips--best-practices)
6. [Troubleshooting](#troubleshooting)

---

## TỔNG QUAN QUY TRÌNH

### **Sơ đồ quy trình chuẩn:**

```
RECEPTION (Tiếp nhận)
    ↓
    [Click "Bắt đầu kiểm tra xe"]
    ↓
INSPECTION (Kiểm tra)
    ├─ Tạo Checklist
    ├─ Kiểm tra từng mục
    ├─ Upload hình ảnh
    └─ Ghi chú chi tiết
    ↓
    [Phát hiện cần phụ tùng?]
    ├─ CÓ → Click "Chọn phụ tùng cần thay"
    │   ↓
    │   QUOTING (Báo giá)
    │   ├─ Advisor gửi báo giá cho Customer
    │   └─ Customer chấp nhận
    │       ↓
    │       [Phụ tùng có sẵn?]
    │       ├─ CÓ → IN_PROGRESS
    │       └─ KHÔNG → WAITING_FOR_PARTS
    │           ↓
    │           [Đợi phụ tùng về]
    │           ↓
    │           IN_PROGRESS
    └─ KHÔNG → IN_PROGRESS
        ↓
        [Thực hiện bảo dưỡng]
        ↓
        READY_FOR_INVOICE (Hoàn thành)
        ↓
        COMPLETED (Đã giao xe)
```

### **Các trạng thái (Status):**

| Status | Tên tiếng Việt | Mô tả | Hành động của Technician |
|--------|----------------|-------|--------------------------|
| `RECEPTION` | Tiếp nhận | Xe đã được tiếp nhận | Ghi nhận thông tin xe, chụp ảnh |
| `INSPECTION` | Kiểm tra | Đang kiểm tra xe | Tạo checklist, kiểm tra, upload ảnh |
| `QUOTING` | Báo giá | Đang chờ duyệt báo giá | Đợi Customer chấp nhận báo giá |
| `WAITING_FOR_PARTS` | Chờ phụ tùng | Đang chờ phụ tùng về | Đợi Advisor thông báo phụ tùng về |
| `IN_PROGRESS` | Đang thực hiện | Đang bảo dưỡng/thay phụ tùng | Thực hiện công việc, cập nhật tiến độ |
| `READY_FOR_INVOICE` | Hoàn thành | Sẵn sàng thanh toán | Giao xe cho Advisor/Customer |
| `COMPLETED` | Đã giao xe | Đã thanh toán và giao xe | Kết thúc |

---

## CHI TIẾT TỪNG BƯỚC

### **BƯỚC 1: TIẾP NHẬN XE (RECEPTION)**

#### **Khi nào:**
- Sau khi Advisor phân công công việc
- Appointment đã được CONFIRMED
- Customer mang xe đến đúng giờ hẹn

#### **Công việc cần làm:**
1. **Kiểm tra thông tin xe:**
   - Xác nhận biển số xe
   - Ghi nhận kilomet hiện tại
   - Kiểm tra tình trạng bên ngoài (vết xước, móp méo)

2. **Chụp ảnh xe:**
   - Chụp 4 góc xe (trước, sau, trái, phải)
   - Chụp bảng đồng hồ (số km)
   - Chụp các vết hư hỏng đã có (nếu có)

3. **Xác nhận với Customer:**
   - Hỏi các vấn đề xe đang gặp phải
   - Xác nhận yêu cầu dịch vụ
   - Thông báo thời gian dự kiến hoàn thành

#### **Hành động:**
- Vào trang **Job List**
- Tìm order có status **"Tiếp nhận"**
- Click vào order → Xem chi tiết
- Click nút **"Bắt đầu kiểm tra xe"** (màu xanh)
- Trạng thái chuyển sang **INSPECTION**

---

### **BƯỚC 2: KIỂM TRA XE (INSPECTION) ⭐ QUAN TRỌNG NHẤT**

#### **Khi nào:**
- Sau khi click "Bắt đầu kiểm tra xe" từ RECEPTION
- Đây là bước quan trọng nhất, quyết định chất lượng dịch vụ

#### **Công việc cần làm:**

##### **2.1. Tạo Checklist**
- Hệ thống tự động tạo Checklist dựa trên Template của dịch vụ
- Ví dụ: "Bảo dưỡng định kỳ 10,000km" có 15 mục kiểm tra
- Mở rộng từng service để xem checklist items

##### **2.2. Kiểm tra từng mục**
Mỗi mục có 3 trạng thái:

| Icon | Status | Khi nào chọn | Ví dụ |
|------|--------|--------------|-------|
| ✅ | **OK** | Mục kiểm tra đạt, không có vấn đề | Đèn chiếu sáng hoạt động bình thường |
| ❌ | **NOT_OK** | Mục có vấn đề, cần sửa/thay | Lốp mòn 80%, cần thay |
| ⏳ | **NOT_CHECKED** | Chưa kiểm tra mục này | (mặc định) |

**Cách kiểm tra:**
1. Click vào từng service để mở rộng checklist
2. Đọc tên mục cần kiểm tra (VD: "Kiểm tra dầu phanh")
3. Thực hiện kiểm tra thực tế trên xe
4. Click vào icon trạng thái phù hợp (✅/❌)
5. **Nếu chọn NOT_OK:**
   - **BẮT BUỘC ghi chú** chi tiết vấn đề
   - **BẮT BUỘC upload hình ảnh** bằng chứng
6. Click **"Lưu"** để lưu kết quả

##### **2.3. Upload hình ảnh**
**Khi nào cần upload:**
- Tất cả các mục NOT_OK phải có ảnh
- Các mục OK nếu muốn chứng minh

**Cách upload:**
1. Click nút **"📷 Chọn ảnh"** ở mục checklist
2. Chọn ảnh từ thiết bị (tối đa 5MB/ảnh)
3. Đợi upload thành công → Hiển thị preview
4. Có thể upload nhiều ảnh cho 1 mục

**Tips chụp ảnh:**
- Chụp rõ nét, đủ ánh sáng
- Chụp cận cảnh vấn đề
- Chụp cả góc rộng để thấy vị trí
- Đánh dấu/khoanh vùng vấn đề nếu cần

##### **2.4. Ghi chú chi tiết**
**Ghi chú tốt phải:**
- Mô tả rõ vấn đề: "Lốp trước trái mòn 80%, còn 2mm rãnh"
- Ghi nguyên nhân (nếu biết): "Do mất cân bằng"
- Gợi ý giải pháp: "Khuyến nghị thay lốp mới"
- Ghi mức độ: "Cần thay gấp", "Nên thay trong 1 tháng"

##### **2.5. Customer theo dõi Real-time**
⚠️ **QUAN TRỌNG:** Trong bước INSPECTION, Customer có thể:
- Xem danh sách checklist items
- Xem trạng thái từng mục (OK/NOT_OK/NOT_CHECKED)
- Xem hình ảnh bạn upload
- Xem ghi chú của bạn
- **Tự động refresh mỗi 10 giây**

→ Vì vậy, hãy cẩn thận và chuyên nghiệp trong việc ghi chú và chụp ảnh!

#### **Hành động tiếp theo:**

##### **Trường hợp 1: KHÔNG cần thay phụ tùng**
- Tất cả mục kiểm tra đều OK hoặc chỉ có vấn đề nhỏ không cần thay
- Click **"Hoàn tất kiểm tra"**
- Xác nhận: "Không có phụ tùng cần thay"
- Trạng thái chuyển thẳng sang **IN_PROGRESS**

##### **Trường hợp 2: CÓ phụ tùng cần thay**
- Có ít nhất 1 mục NOT_OK cần thay phụ tùng
- Click **"Chọn phụ tùng cần thay"**
- Chọn parts từ danh sách
- Click **"Hoàn tất kiểm tra"**
- Xác nhận: "Có phụ tùng cần thay, chuyển sang báo giá"
- Trạng thái chuyển sang **QUOTING**

---

### **BƯỚC 3: BÁO GIÁ (QUOTING) - CHỈ KHI CẦN PHỤ TÙNG**

#### **Khi nào:**
- Khi bạn chọn có phụ tùng cần thay từ bước INSPECTION
- Hệ thống tự động chuyển sang QUOTING

#### **Công việc cần làm:**
1. **Kiểm tra lại danh sách phụ tùng:**
   - Đảm bảo đã chọn đủ parts cần thay
   - Nếu sai, có thể click **"Chỉnh sửa phụ tùng"** để điều chỉnh

2. **Đợi Advisor xử lý:**
   - Advisor sẽ review báo giá
   - Advisor gửi báo giá cho Customer
   - Customer xem và quyết định chấp nhận/từ chối

3. **Nhận thông báo:**
   - Nếu Customer **chấp nhận** → Nhận notification
   - Nếu Customer **từ chối** → Thảo luận với Advisor

#### **Hành động tiếp theo:**
- Sau khi Customer chấp nhận báo giá
- Click **"Xác nhận phụ tùng"**
- Hệ thống hỏi: **"Phụ tùng đã có sẵn trong kho?"**
  - ✅ **YES** → Chuyển sang **IN_PROGRESS** (bắt đầu thực hiện luôn)
  - ❌ **NO** → Chuyển sang **WAITING_FOR_PARTS** (đợi phụ tùng về)

---

### **BƯỚC 4: CHỜ PHỤ TÙNG (WAITING_FOR_PARTS) - CHỈ KHI CHƯA CÓ SẴN**

#### **Khi nào:**
- Khi phụ tùng cần thay chưa có sẵn trong kho
- Advisor/Quản lý kho cần đặt hàng

#### **Công việc cần làm:**
1. **Theo dõi tiến độ:**
   - Check với Advisor về thời gian dự kiến phụ tùng về
   - Thông báo Customer về delay (nếu có)

2. **Chuẩn bị công việc:**
   - Chuẩn bị dụng cụ, thiết bị cần thiết
   - Xem lại hướng dẫn thay phụ tùng (nếu cần)

3. **Nhận thông báo:**
   - Advisor/Quản lý kho sẽ thông báo khi phụ tùng về
   - Kiểm tra phụ tùng có đúng không

#### **Hành động tiếp theo:**
- Khi phụ tùng đã về đầy đủ
- Click **"Phụ tùng đã về"**
- Xác nhận: "Phụ tùng đã về đầy đủ. Bắt đầu thực hiện?"
- Trạng thái chuyển sang **IN_PROGRESS**

---

### **BƯỚC 5: THỰC HIỆN BẢO DƯỠNG (IN_PROGRESS)**

#### **Khi nào:**
- Sau khi hoàn tất kiểm tra (nếu không cần phụ tùng)
- Sau khi xác nhận phụ tùng có sẵn (từ QUOTING)
- Sau khi phụ tùng về (từ WAITING_FOR_PARTS)

#### **Công việc cần làm:**

##### **5.1. Thay phụ tùng (nếu có)**
1. Lấy phụ tùng từ kho
2. Thực hiện thay thế theo quy trình chuẩn
3. Chụp ảnh phụ tùng cũ và mới
4. Ghi chú công việc đã làm

##### **5.2. Thực hiện bảo dưỡng**
1. Thực hiện các công việc theo dịch vụ
2. Cập nhật checklist khi hoàn thành mỗi mục
3. Test lại xe sau khi hoàn thành
4. Vệ sinh xe (nếu có trong dịch vụ)

##### **5.3. Cập nhật tiến độ**
- Cập nhật ghi chú về công việc đã làm
- Upload ảnh kết quả (nếu cần)
- Ghi chú các phát hiện bổ sung

#### **Kiểm tra trước khi hoàn thành:**
- ✅ Đã thay đủ phụ tùng đã chọn
- ✅ Đã thực hiện đủ các công việc trong dịch vụ
- ✅ Đã cập nhật tất cả checklist items
- ✅ Đã test lại xe (nổ máy, chạy thử)
- ✅ Không còn vấn đề nào tồn đọng

#### **Hành động:**
- Click **"Hoàn thành công việc"**
- Hệ thống kiểm tra:
  - ⚠️ Có mục checklist nào còn NOT_CHECKED không?
  - Nếu có → Hiển thị cảnh báo
- Xác nhận hoàn thành
- Trạng thái chuyển sang **READY_FOR_INVOICE**

---

### **BƯỚC 6: HOÀN THÀNH (READY_FOR_INVOICE)**

#### **Khi nào:**
- Sau khi click "Hoàn thành công việc"
- Hệ thống tự động tạo Invoice

#### **Công việc cần làm:**
1. **Kiểm tra Invoice:**
   - Xem lại danh sách dịch vụ đã thực hiện
   - Xem lại danh sách phụ tùng đã thay
   - Đảm bảo tổng chi phí chính xác

2. **Chuẩn bị giao xe:**
   - Vệ sinh xe sạch sẽ
   - Đặt ghế, gương về vị trí ban đầu
   - Chuẩn bị phụ tùng cũ để trả lại Customer (nếu yêu cầu)

3. **Giải thích công việc:**
   - Chuẩn bị giải thích cho Customer về:
     - Công việc đã làm
     - Phụ tùng đã thay (tại sao phải thay)
     - Các vấn đề phát hiện thêm (nếu có)
     - Khuyến nghị bảo dưỡng lần sau

#### **Giao xe cho Advisor:**
- Thông báo Advisor xe đã sẵn sàng
- Bàn giao chìa khóa
- Giải thích công việc đã làm
- Advisor sẽ giao xe cho Customer

---

### **BƯỚC 7: ĐÃ GIAO XE (COMPLETED)**

#### **Khi nào:**
- Sau khi Customer thanh toán và nhận xe
- Advisor cập nhật trạng thái

#### **Kết thúc quy trình:**
- Order chuyển sang COMPLETED
- Không còn hành động nào cần làm
- Chờ đơn hàng tiếp theo

---

## QUẢN LÝ CHECKLIST

### **Checklist là gì?**
- Danh sách các mục cần kiểm tra theo từng dịch vụ
- Được tạo tự động từ Template
- Giúp đảm bảo không bỏ sót công việc

### **Cách sử dụng Checklist:**

#### **1. Xem checklist**
- Vào order detail → Click vào service → Mở rộng accordion
- Hiển thị danh sách các mục cần kiểm tra

#### **2. Cập nhật trạng thái**
- Click vào icon trạng thái: ✅ OK / ❌ NOT_OK / ⏳ NOT_CHECKED
- Chọn trạng thái phù hợp

#### **3. Thêm ghi chú**
- Nhập ghi chú vào ô text area
- Ghi chi tiết về tình trạng
- **BẮT BUỘC** nếu chọn NOT_OK

#### **4. Upload hình ảnh**
- Click **"📷 Chọn ảnh"**
- Chọn file từ thiết bị
- Chờ upload xong (hiển thị preview)
- **BẮT BUỘC** nếu chọn NOT_OK

#### **5. Lưu kết quả**
- Click **"💾 Lưu"** sau mỗi thay đổi
- Kết quả được lưu ngay lập tức
- Customer có thể thấy real-time

### **Tips Checklist:**
- ✅ Kiểm tra tuần tự từ trên xuống
- ✅ Đánh dấu OK ngay khi kiểm tra xong
- ✅ Ghi chú ngay, đừng để sau kẻo quên
- ✅ Chụp ảnh nhiều góc cho rõ ràng
- ❌ Không bỏ qua mục nào dù nhỏ
- ❌ Không đánh dấu OK khi chưa kiểm tra

---

## QUẢN LÝ PHỤ TÙNG

### **Khi nào cần chọn phụ tùng?**
- Phát hiện vấn đề trong bước INSPECTION
- Checklist item có trạng thái NOT_OK và cần thay thế
- VD: Lốp mòn, má phanh hết, bình ắc quy yếu

### **Cách chọn phụ tùng:**

#### **1. Từ trang Job List (Bước INSPECTION):**
- Click **"Chọn phụ tùng cần thay"**
- Chuyển đến trang Parts Request

#### **2. Tại trang Parts Request:**
1. **Xem danh sách parts có sẵn:**
   - Hiển thị tất cả parts trong hệ thống
   - Filter theo category (Lốp, Phanh, Ắc quy...)

2. **Chọn parts cần thay:**
   - Click vào part → Nhập số lượng
   - Click **"Thêm vào danh sách"**

3. **Điền thông tin bổ sung:**
   - Ghi chú tại sao cần thay part này
   - Upload ảnh bằng chứng từ checklist

4. **Gửi yêu cầu:**
   - Click **"Gửi yêu cầu phụ tùng"**
   - Hệ thống tự động tạo Quote

#### **3. Chỉnh sửa parts (Nếu cần):**
- Từ trang Job List → Click **"Chỉnh sửa phụ tùng"**
- Thêm/Xóa/Sửa parts
- Click **"Cập nhật"**

### **Lưu ý về phụ tùng:**
- ⚠️ Chỉ chọn parts thực sự cần thiết
- ⚠️ Kiểm tra tình trạng kho trước khi chọn
- ⚠️ Hỏi Customer nếu có nhiều lựa chọn (phụ tùng chính hãng vs tương đương)
- ⚠️ Ghi chú rõ ràng để Advisor và Customer hiểu

---

## TIPS & BEST PRACTICES

### **Làm việc hiệu quả:**
1. ✅ **Kiểm tra thông tin order trước khi bắt đầu**
2. ✅ **Chụp ảnh tình trạng xe ban đầu để tránh tranh cãi sau này**
3. ✅ **Cập nhật checklist ngay, đừng để tích lũy**
4. ✅ **Ghi chú chi tiết giúp Advisor và Customer hiểu rõ**
5. ✅ **Upload ảnh rõ nét, đủ ánh sáng**
6. ✅ **Thông báo Advisor sớm nếu phát hiện vấn đề lớn**

### **Giao tiếp với Customer:**
- 👍 **Minh bạch**: Giải thích rõ vấn đề xe gặp phải
- 👍 **Chuyên nghiệp**: Dùng thuật ngữ dễ hiểu
- 👍 **Tôn trọng**: Lắng nghe yêu cầu của Customer
- 👍 **Trung thực**: Không thổi phồng vấn đề để bán phụ tùng

### **Quản lý thời gian:**
- ⏰ Ước tính thời gian cần thiết cho mỗi công việc
- ⏰ Thông báo Customer nếu cần thêm thời gian
- ⏰ Ưu tiên công việc theo độ khẩn cấp
- ⏰ Không nhận quá nhiều order cùng lúc

---

## TROUBLESHOOTING

### **❓ Không thấy order của mình?**
- Kiểm tra Advisor đã phân công chưa
- Kiểm tra tab filter (All / Pending / In Progress / Completed)
- Refresh lại trang (F5)

### **❓ Không upload được hình ảnh?**
- Kiểm tra kích thước file (tối đa 5MB)
- Kiểm tra định dạng (JPG, PNG, JPEG)
- Kiểm tra kết nối internet
- Thử chụp lại với độ phân giải thấp hơn

### **❓ Không lưu được checklist?**
- Kiểm tra đã nhập đầy đủ thông tin bắt buộc
- Nếu chọn NOT_OK: Phải có ghi chú và hình ảnh
- Kiểm tra token còn hạn không (đăng nhập lại)

### **❓ Không chuyển được trạng thái?**
- Kiểm tra có đúng flow không (RECEPTION → INSPECTION → ...)
- Kiểm tra quyền (có phải Technician không)
- Kiểm tra order có bị lock bởi ai khác không

### **❓ Customer phàn nàn không thấy checklist?**
- Kiểm tra order có đang ở trạng thái INSPECTION không
- Kiểm tra đã tạo checklist chưa
- Kiểm tra đã lưu kết quả checklist chưa
- Hướng dẫn Customer refresh lại trang (Ctrl + Shift + R)

### **❓ Không tìm thấy phụ tùng cần thay?**
- Liên hệ Advisor để thêm part vào hệ thống
- Hoặc ghi chú tên part vào mục "Ghi chú" của checklist
- Advisor sẽ tìm và đặt hàng part đó

---

## KẾT LUẬN

Quy trình làm việc được thiết kế để:
- ✅ **Minh bạch**: Customer biết chính xác công việc đang làm
- ✅ **Hiệu quả**: Giảm thời gian chờ đợi, tăng năng suất
- ✅ **Chuyên nghiệp**: Nâng cao chất lượng dịch vụ
- ✅ **Dễ quản lý**: Theo dõi tiến độ real-time

**Hãy tuân thủ quy trình để đảm bảo chất lượng dịch vụ tốt nhất!** 💪

---

**Tài liệu được tạo bởi: APEX EV Development Team**  
**Ngày cập nhật: 06/12/2025**  
**Phiên bản: 1.0**  
**Dành cho: Kỹ thuật viên (Technician)**
