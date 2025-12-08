# HƯỚNG DẪN SỬA FRONTEND - OrderTracking.jsx

## ✅ Backend đã hoàn thành
- API mới: `GET /api/checklist/service-order/{orderId}/items`
- Trả về tất cả service_checklist_items kèm results đã submit

## 📝 CẦN SỬA FRONTEND (3 bước đơn giản)

### BƯỚC 1: Sửa imports (dòng 24-25)

**XÓA:**
```javascript
import { getChecklistsByOrder, getChecklistResults, getTemplateById } from '../../services/checklistService';
import { getFileViewUrl } from '../../services/uploadService';
```

**THÊM:**
```javascript
import { getServiceChecklistItemsForOrder } from '../../services/checklistService';
```

---

### BƯỚC 2: Sửa state variables (tìm dòng khai báo state)

**XÓA:**
```javascript
const [checklists, setChecklists] = useState([]);
const [checklistsWithItems, setChecklistsWithItems] = useState([]);
```

**THAY BẰNG:**
```javascript
const [checklistItems, setChecklistItems] = useState([]);
```

---

### BƯỚC 3: Sửa hàm fetchChecklists()

**XÓA toàn bộ hàm `fetchChecklists()` (khoảng 70 dòng code)**

**THAY BẰNG:**
```javascript
const fetchChecklistItems = async () => {
  try {
    console.log('Fetching service checklist items for orderId:', orderId);
    const items = await getServiceChecklistItemsForOrder(orderId);
    console.log('Service checklist items fetched:', items);
    setChecklistItems(items || []);
  } catch (err) {
    console.error('Error fetching service checklist items:', err);
    if (err.response?.status === 404 || err.response?.status === 204) {
      setChecklistItems([]);
    }
  }
};
```

**Và sửa useEffect:**
```javascript
useEffect(() => {
  fetchOrder();
  fetchChecklistItems(); // Đổi tên từ fetchChecklists()

  const interval = setInterval(() => {
    fetchOrder();
    fetchChecklistItems(); // Đổi tên từ fetchChecklists()
  }, 5000);

  return () => clearInterval(interval);
}, [orderId]);
```

---

### BƯỚC 4: Sửa phần render checklist

**Tìm dòng có `{checklistsWithItems.length > 0 && (`**

**THAY BẰNG:**
```javascript
{checklistItems.length > 0 && (
  <Badge bg="primary" className="ms-2">{checklistItems.length}</Badge>
)}
```

**Tìm dòng `{checklistsWithItems.length === 0 ? (`**

**THAY BẰNG:**
```javascript
{checklistItems.length === 0 ? (
```

**Tìm block `{checklistsWithItems.map((checklist, checklistIdx) => (`**

**THAY BẰNG:**
```javascript
{checklistItems.map((item, idx) => {
  const itemStatus = getItemStatusConfig(item.status);
  
  return (
    <div key={idx} className="checklist-item-card-modern">
      <div className="item-header-row">
        <div className="item-info-col">
          <div className="d-flex align-items-center mb-2">
            <span className={`item-status-badge status-${itemStatus.className}`}>
              {itemStatus.icon}
              {itemStatus.label}
            </span>
          </div>
          <h6 className="item-name mb-1">{item.itemName}</h6>
          {item.itemDescription && (
            <p className="item-description mb-2">{item.itemDescription}</p>
          )}
          {item.estimatedTime && (
            <p className="item-meta">
              <FiClock className="me-1" />
              Thời gian ước tính: {item.estimatedTime} phút
            </p>
          )}
        </div>

        {/* Evidence */}
        {item.mediaUrl && (
          <div className="evidence-col">
            {item.mediaType === 'IMAGE' ? (
              <img 
                src={item.mediaUrl} 
                alt="Evidence" 
                className="evidence-thumbnail"
                onClick={() => setImageModalUrl(item.mediaUrl)}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Technician Notes */}
      {item.technicianNotes && (
        <div className="technician-notes mt-3">
          <p className="notes-label">
            <FiFileText className="me-2" />
            Ghi chú của kỹ thuật viên:
          </p>
          <p className="notes-content">{item.technicianNotes}</p>
        </div>
      )}
    </div>
  );
})}
```

---

## 🎯 KẾT QUẢ

Sau khi sửa xong:
- ✅ Customer xem được **18 checklist items** ngay lập tức
- ✅ Items chưa submit hiển thị trạng thái "PENDING"
- ✅ Items đã submit hiển thị status, notes, evidence
- ✅ Real-time update mỗi 5 giây

## 📌 LƯU Ý

Service API đã được thêm vào `checklistService.js`:
```javascript
export const getServiceChecklistItemsForOrder = async (serviceOrderId) => {
  const response = await axios.get(`${API_URL}/service-order/${serviceOrderId}/items`, {
    headers: getAuthHeader()
  });
  return response.data;
};
```

Backend đang chạy ở: `http://localhost:8081`
Frontend: `http://localhost:5173`

Test bằng cách truy cập: `http://localhost:5173/customer/order-tracking/20`
