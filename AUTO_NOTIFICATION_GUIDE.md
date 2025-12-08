# 🔔 AUTO-NOTIFICATION SYSTEM - TRACKING ORDER

## 📋 TỔNG QUAN

Hệ thống tự động thông báo cho khách hàng khi:
1. **Kỹ thuật viên hoàn thành tất cả checklist của một dịch vụ**
2. **Phát hiện vấn đề/lỗi trong quá trình bảo dưỡng**

---

## 🚀 CƠ CHẾ HOẠT ĐỘNG

### 1. AUTO-REFRESH (5 giây)
```javascript
useEffect(() => {
  fetchOrderDetail();
  fetchChecklistItems();
  
  // Auto refresh mỗi 5s để cập nhật real-time
  const interval = setInterval(() => {
    fetchChecklistItems();
  }, 5000);
  
  return () => clearInterval(interval);
}, [orderId]);
```

### 2. DETECTION LOGIC
```javascript
useEffect(() => {
  // Compare previous vs current checklist items
  // Detect 2 cases:
  
  // Case 1: Service completed (pending: 0, was > 0 before)
  if (currentPending === 0 && previousPending > 0) {
    showToast(message, hasIssues ? 'warning' : 'success');
  }
  
  // Case 2: New issues found (failed count increased)
  if (currentFailed > previousFailed) {
    showToast(message, 'warning');
  }
}, [checklistItems]);
```

### 3. VISUAL INDICATORS

#### Service Completed - Green Glow
```css
.checklist-card-soft.service-completed {
  border-color: rgba(52, 199, 89, 0.4);
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.15);
}
```

#### Service Completed with Issues - Orange Glow
```css
.checklist-card-soft.service-has-issues {
  border-color: rgba(255, 149, 0, 0.4);
  box-shadow: 0 4px 16px rgba(255, 149, 0, 0.15);
}
```

#### Completion Badge
```jsx
<span className="completion-badge-soft">
  {hasIssues ? (
    <>
      <FiAlertCircle size={14} />
      <span>Hoàn thành (Có vấn đề)</span>
    </>
  ) : (
    <>
      <FiCheckCircle size={14} />
      <span>Hoàn thành</span>
    </>
  )}
</span>
```

---

## 📁 FILES MODIFIED

### 1. **OrderTracking.jsx**
```
c:\Project OJT\ApexEV_FE\src\pages\customer\OrderTracking.jsx
```

**Changes:**
- ✅ Added state: `previousChecklistItems`, `serviceCompletionStatus`, `toastNotification`
- ✅ Added useEffect to detect service completion & issues
- ✅ Added `showToast()` helper function
- ✅ Added visual indicators: completion badges, colored card borders
- ✅ Imported `ToastNotification` component

### 2. **OrderTracking.css**
```
c:\Project OJT\ApexEV_FE\src\pages\customer\OrderTracking.css
```

**Changes:**
- ✅ Added `.completion-badge-soft` with green gradient
- ✅ Added `.service-has-issues .completion-badge-soft` with orange gradient
- ✅ Added `.service-completed` with green glow effect
- ✅ Added `.service-has-issues` with orange glow effect
- ✅ Added `@keyframes fadeInBounce` animation
- ✅ Added `.completion-time-soft` style

### 3. **ToastNotification.jsx** (NEW)
```
c:\Project OJT\ApexEV_FE\src\components\common\ToastNotification.jsx
```

**Purpose:** Beautiful toast notification component
- ✅ Success type: Green icon + message
- ✅ Warning type: Orange icon + message
- ✅ Auto-hide after 5 seconds
- ✅ Smooth slide-in/out animations

### 4. **ToastNotification.css** (NEW)
```
c:\Project OJT\ApexEV_FE\src\components\common\ToastNotification.css
```

**Features:**
- ✅ Fixed position (top-right)
- ✅ Glassmorphism effect
- ✅ Slide-in/out animations
- ✅ Responsive design (mobile-friendly)

---

## 🎯 NOTIFICATION SCENARIOS

### Scenario 1: Service Completed Successfully ✅
**Trigger:** Tất cả items của service đều PASSED/COMPLETED (không còn PENDING)

**Visual:**
- 🟢 Green glow around service card
- 🟢 Green "Hoàn thành" badge
- 🟢 Green toast: "Dịch vụ ABC đã hoàn thành xuất sắc!"

**Data Flow:**
```
Technician marks last item as PASSED 
→ 5s refresh interval
→ Detect: currentPending = 0, previousPending > 0
→ Show green toast
→ Add completion badge
→ Apply green glow to card
```

---

### Scenario 2: Service Completed with Issues ⚠️
**Trigger:** Tất cả items đã check (không còn PENDING) nhưng có FAILED/NEEDS_ATTENTION/NEEDS_REPLACEMENT

**Visual:**
- 🟠 Orange glow around service card
- 🟠 Orange "Hoàn thành (Có vấn đề)" badge
- 🟠 Orange toast: "Dịch vụ ABC hoàn thành nhưng phát hiện X vấn đề!"

**Data Flow:**
```
Technician marks last item (some FAILED)
→ 5s refresh interval
→ Detect: currentPending = 0, currentFailed > 0
→ Show orange toast
→ Add orange completion badge
→ Apply orange glow to card
```

---

### Scenario 3: New Issue Found 🔍
**Trigger:** Số lượng items có vấn đề tăng lên (failed count tăng)

**Visual:**
- 🟠 Orange toast: "Kỹ thuật viên phát hiện X vấn đề trong dịch vụ ABC"

**Data Flow:**
```
Technician marks item as FAILED
→ 5s refresh interval
→ Detect: currentFailed > previousFailed
→ Show orange toast with issue count
```

---

## 🧪 TESTING GUIDE

### Test Case 1: Complete Service Successfully
1. Login as **Technician**
2. Vào order đang INSPECTION
3. Mark tất cả checklist items của 1 service là **PASSED**
4. Đợi 5 giây
5. Chuyển sang tab **Customer** (hoặc login customer khác)
6. Vào OrderTracking của order đó
7. **Expected:**
   - ✅ Toast notification màu xanh xuất hiện: "Dịch vụ ... đã hoàn thành xuất sắc!"
   - ✅ Service card có green glow
   - ✅ Xuất hiện badge "Hoàn thành" màu xanh

### Test Case 2: Complete Service with Issues
1. Login as **Technician**
2. Mark các items: một số PASSED, một số FAILED/NEEDS_ATTENTION
3. Mark item cuối cùng (để pending = 0)
4. Đợi 5 giây
5. Check trang Customer
6. **Expected:**
   - ⚠️ Toast notification màu cam: "Dịch vụ ... hoàn thành nhưng phát hiện X vấn đề!"
   - 🟠 Service card có orange glow
   - 🟠 Badge "Hoàn thành (Có vấn đề)" màu cam

### Test Case 3: Find New Issue During Inspection
1. Login as **Technician**
2. Service đang trong quá trình check (còn pending items)
3. Mark 1 item từ PENDING → FAILED
4. Đợi 5 giây
5. Check trang Customer
6. **Expected:**
   - ⚠️ Toast notification: "Kỹ thuật viên phát hiện X vấn đề..."
   - Service card chưa có completion badge (vì chưa hoàn thành hết)

---

## 🎨 UI/UX FEATURES

### 1. Toast Notification
- **Position:** Fixed top-right (mobile: full-width)
- **Animation:** Slide-in from right, bounce effect
- **Auto-hide:** 5 seconds
- **Manual close:** X button
- **Types:** Success (green) / Warning (orange)

### 2. Service Card Indicators
- **Normal State:** White background, light border
- **Completed State:** Green glow, green badge
- **Issues State:** Orange glow, orange badge
- **Hover Effect:** Lift up with shadow

### 3. Completion Badge
- **Position:** Next to service name
- **Animation:** Fade-in bounce
- **Icon:** CheckCircle (success) / AlertCircle (warning)
- **Text:** "Hoàn thành" / "Hoàn thành (Có vấn đề)"

### 4. Timestamp Display
- **Format:** "Cập nhật HH:mm"
- **Color:** Sky blue (#3B92D8)
- **Position:** In service meta row

---

## 🔧 CONFIGURATION

### Auto-refresh Interval
```javascript
const REFRESH_INTERVAL = 5000; // 5 seconds
```

### Toast Auto-hide Duration
```javascript
const TOAST_DURATION = 5000; // 5 seconds
```

### Status Definitions
```javascript
const STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  NEEDS_REPLACEMENT: 'NEEDS_REPLACEMENT',
  PENDING: 'PENDING'
};
```

---

## 📊 STATE MANAGEMENT

### Key States
```javascript
const [checklistItems, setChecklistItems] = useState([]);
const [previousChecklistItems, setPreviousChecklistItems] = useState([]);
const [serviceCompletionStatus, setServiceCompletionStatus] = useState({});
const [toastNotification, setToastNotification] = useState(null);
```

### serviceCompletionStatus Structure
```javascript
{
  [serviceId]: {
    completed: true,
    hasIssues: false,
    timestamp: '2025-01-15T10:30:00.000Z',
    message: 'Dịch vụ ABC đã hoàn thành xuất sắc!'
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: Notification không hiện
**Check:**
1. Console log có hiện "🎉 Service completed!" không?
2. `checklistItems` và `previousChecklistItems` có khác nhau không?
3. `toastNotification` state có được set không?

### Issue: Badge không hiển thị
**Check:**
1. `isCompleted` = true? (pendingCount === 0)
2. CSS class `.completion-badge-soft` có được apply không?
3. Check responsive breakpoints

### Issue: Glow effect không xuất hiện
**Check:**
1. CSS classes `.service-completed` / `.service-has-issues` có được add không?
2. Browser có support box-shadow với rgba không?

---

## 🎯 NEXT STEPS (Optional Enhancements)

### 1. Sound Notification
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
};
```

### 2. Browser Push Notification
```javascript
if (Notification.permission === 'granted') {
  new Notification('APEX EV', {
    body: message,
    icon: '/logo.png'
  });
}
```

### 3. Email Notification
- Backend trigger email khi service completed
- Use Spring Boot Mail Service

### 4. SMS Notification
- Integrate with Twilio/AWS SNS
- Send SMS when critical issues found

---

## ✅ CHECKLIST

- [x] Auto-refresh every 5 seconds
- [x] Detect service completion
- [x] Detect new issues found
- [x] Show toast notifications
- [x] Visual indicators (badges, glows)
- [x] Responsive design
- [x] Smooth animations
- [x] Auto-hide toast
- [x] Manual close toast
- [x] Console logging for debugging
- [x] State management
- [x] CSS styling

---

## 📞 SUPPORT

Nếu có vấn đề, check console logs:
- 🔄 "Fetching service checklist items..."
- 🎉 "Service ... đã hoàn thành!"
- ⚠️ "Service ... phát hiện ... vấn đề mới!"
- 📊 Status breakdown (total, passed, failed, pending counts)

---

## 🎉 DONE!

Hệ thống auto-notification đã hoàn thành!
Customer giờ sẽ nhận thông báo real-time khi:
- ✅ Service hoàn thành
- ⚠️ Phát hiện vấn đề

**Enjoy the smooth UX! 🚀**
