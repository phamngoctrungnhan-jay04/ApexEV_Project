# BUSINESS_MANAGER API Documentation

## Overview
This module provides comprehensive HR management features for users with `BUSINESS_MANAGER` role:
- **Shift Scheduling**: Create shifts, assign employees, detect conflicts
- **Employee Profiles**: Manage staff information, positions, departments, leave balances
- **Performance Management**: Create reviews, set KPI scores, finalize evaluations
- **Leave Management**: Create/approve leave requests, check balances, conflict detection

## Authentication
All endpoints require JWT token with `BUSINESS_MANAGER` role.
```http
Authorization: Bearer <your-jwt-token>
```

---

## 1. Shift Management API

### Base URL: `/api/shifts`

#### Create Shift
```http
POST /api/shifts
```
**Request Body:**
```json
{
  "name": "Ca sáng",
  "startTime": "2025-11-15T08:00:00",
  "endTime": "2025-11-15T16:00:00",
  "location": "Xưởng A",
  "description": "Ca làm việc buổi sáng"
}
```

#### Assign Staff to Shift
```http
POST /api/shifts/assign
```
**Request Body:**
```json
{
  "shiftId": 1,
  "staffIds": [10, 11, 12],
  "notes": "Phân công ca làm việc"
}
```
**Conflict Detection:**
- Checks if staff already assigned to overlapping shift
- Checks if staff has approved leave during shift time

#### Get All Shifts
```http
GET /api/shifts
```

#### Get Shift by ID
```http
GET /api/shifts/{shiftId}
```

#### Delete Shift
```http
DELETE /api/shifts/{shiftId}
```

---

## 2. Leave Management API

### Base URL: `/api/leave`

#### Create Leave Request (for employee)
```http
POST /api/leave/request
```
**Request Body:**
```json
{
  "staffId": 10,
  "leaveTypeId": 1,
  "startDate": "2025-11-20",
  "endDate": "2025-11-22",
  "reason": "Nghỉ phép cá nhân",
  "documentUrl": "https://example.com/doc.pdf"
}
```
**Validation:**
- Checks sufficient leave balance
- Checks no overlapping shifts
- Auto-calculates total days

#### Approve/Reject Leave Request
```http
PUT /api/leave/{leaveRequestId}/approve
```
**Request Body:**
```json
{
  "approved": true,
  "rejectionReason": null
}
```
or
```json
{
  "approved": false,
  "rejectionReason": "Không đủ nhân sự trong thời gian này"
}
```
**On Approval:**
- Deducts leave balance from staff profile
- Sets approver and approved timestamp

#### Get All Leave Requests
```http
GET /api/leave
```

#### Get Pending Leave Requests
```http
GET /api/leave/pending
```

---

## 3. Employee Management API

### Base URL: `/api/employees`

#### Get All Staff
```http
GET /api/employees
```
**Response:**
```json
[
  {
    "userId": 10,
    "fullName": "Nguyễn Văn A",
    "email": "a@example.com",
    "phone": "0901234567",
    "employeeCode": "APEX-KTV-001",
    "position": "Kỹ thuật viên",
    "department": "Kỹ thuật",
    "managerId": 5,
    "managerName": "Trần Văn B",
    "hireDate": "2023-01-15",
    "annualLeaveBalance": 12,
    "sickLeaveBalance": 7,
    "isActive": true
  }
]
```

#### Get Staff by ID
```http
GET /api/employees/{staffId}
```

#### Update Staff Profile
```http
PUT /api/employees/{staffId}
```
**Request Body:**
```json
{
  "position": "Kỹ thuật viên trưởng",
  "department": "Kỹ thuật",
  "managerId": 5,
  "hireDate": "2023-01-15",
  "annualLeaveBalance": 15,
  "sickLeaveBalance": 7,
  "isActive": true
}
```

---

## 4. Performance Management API

### Base URL: `/api/performance`

#### Create Performance Review
```http
POST /api/performance/reviews
```
**Request Body:**
```json
{
  "staffId": 10,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-03-31",
  "overallRating": 4.2,
  "strengths": "Kỹ năng kỹ thuật tốt, tinh thần trách nhiệm cao",
  "weaknesses": "Cần cải thiện kỹ năng giao tiếp",
  "recommendations": "Tham gia khóa đào tạo soft skills",
  "feedback": "Nhân viên xuất sắc trong quý này",
  "kpis": [
    {
      "kpiId": 1,
      "score": 4.5,
      "comment": "Hoàn thành công việc đúng hạn"
    },
    {
      "kpiId": 2,
      "score": 4.0,
      "comment": "Chất lượng tốt"
    }
  ]
}
```

#### Finalize Review
```http
PUT /api/performance/reviews/{reviewId}/finalize
```
Changes status to `FINALIZED` and locks the review.

#### Get All Reviews
```http
GET /api/performance/reviews
```

#### Get Reviews by Staff
```http
GET /api/performance/reviews/staff/{staffId}
```

#### Get Review by ID
```http
GET /api/performance/reviews/{reviewId}
```
**Response:**
```json
{
  "reviewId": 1,
  "staffId": 10,
  "staffName": "Nguyễn Văn A",
  "reviewerName": "Trần Văn B",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-03-31",
  "status": "FINALIZED",
  "overallRating": 4.2,
  "strengths": "...",
  "weaknesses": "...",
  "recommendations": "...",
  "feedback": "...",
  "finalizedAt": "2025-04-01T10:30:00",
  "kpiScores": [
    {
      "kpiId": 1,
      "kpiName": "Năng suất làm việc",
      "score": 4.5,
      "comment": "Hoàn thành công việc đúng hạn"
    }
  ]
}
```

---

## Enums

### ShiftStatus
- `SCHEDULED`: Đã lên lịch
- `IN_PROGRESS`: Đang diễn ra
- `COMPLETED`: Đã hoàn thành
- `CANCELLED`: Đã hủy

### LeaveStatus
- `PENDING`: Chờ duyệt
- `APPROVED`: Đã duyệt
- `REJECTED`: Đã từ chối
- `CANCELLED`: Đã hủy

### ReviewStatus
- `DRAFT`: Bản nháp
- `SUBMITTED`: Đã gửi
- `IN_REVIEW`: Đang đánh giá
- `FINALIZED`: Đã hoàn tất

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Thời gian kết thúc phải sau thời gian bắt đầu"
}
```

### 404 Not Found
```json
{
  "message": "Không tìm thấy nhân viên"
}
```

### 409 Conflict
```json
{
  "message": "Nhân viên đã có ca làm việc trùng thời gian"
}
```

### 403 Forbidden
```json
{
  "message": "Access Denied"
}
```

---

## Database Schema

### Key Tables
- `shifts` - Ca làm việc
- `shift_assignments` - Phân công ca
- `leave_types` - Loại nghỉ phép
- `leave_requests` - Đơn xin nghỉ
- `performance_reviews` - Đánh giá hiệu suất
- `kpis` - Chỉ số KPI
- `review_kpis` - Điểm KPI trong đánh giá
- `staff_profiles` (extended) - Hồ sơ nhân viên

### Relationships
- Shift 1-N ShiftAssignment N-1 User (Staff)
- LeaveRequest N-1 User (Staff), N-1 LeaveType, N-1 User (Approver)
- PerformanceReview N-1 User (Staff), N-1 User (Reviewer), 1-N ReviewKPI
- ReviewKPI N-1 KPI

---

## Testing

### 1. Seed Initial Data
Run `src/main/resources/data-seed.sql` to create leave types and KPIs.

### 2. Create Test User with BUSINESS_MANAGER Role
```sql
INSERT INTO user (full_name, email, phone, password_hash, role, is_active) 
VALUES ('Manager Test', 'manager@test.com', '0900000000', '$2a$10$...', 'BUSINESS_MANAGER', true);
```

### 3. Test Endpoints
Use Swagger UI at `http://localhost:8080/swagger-ui/index.html` or Postman.

### 4. Conflict Testing
- Try assigning staff to overlapping shifts → Should return 409 Conflict
- Try creating leave request when shift exists → Should return 409 Conflict
- Try approving leave with insufficient balance → Should return 409 Conflict

---

## Notes
- All timestamps use UTC timezone (configured in `application.properties`)
- Leave balance is automatically deducted on approval
- Shift conflicts check both shift assignments and approved leaves
- Performance reviews can only be finalized once
- Vietnamese field names and messages for consistency with existing codebase

