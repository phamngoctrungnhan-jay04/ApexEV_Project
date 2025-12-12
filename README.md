
![Architecture](ApexEV_BE/.attachments/architecture-diagram.png)

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Công nghệ](#công-nghệ)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#tính-năng)
- [Cài đặt & Chạy](#cài-đặt--chạy)
- [Deployment AWS](#deployment-aws)
- [API Documentation](#api-documentation)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

---

## 🎯 Giới thiệu

**APEX EV** là hệ thống quản lý đặt lịch và bảo dưỡng xe điện toàn diện, giúp:
- **Khách hàng**: Đặt lịch bảo dưỡng, theo dõi tiến độ realtime, xem kết quả kiểm tra chi tiết
- **Kỹ thuật viên**: Quản lý công việc, checklist kiểm tra, upload ảnh minh chứng lên S3
- **Cố vấn dịch vụ**: Quản lý đơn hàng, báo giá, xuất hóa đơn
- **Quản lý**: Dashboard thống kê, quản lý nhân sự, dịch vụ, phụ tùng

### Điểm nổi bật:
✅ **Auto-refresh Realtime**: Customer tự động nhận thông báo khi technician hoàn thành kiểm tra  
✅ **S3 Image Upload**: Upload ảnh checklist lên AWS S3, hiển thị presigned URL  
✅ **AI Chatbot**: Tích hợp AWS Bedrock (Claude) qua Lambda + API Gateway  
✅ **Modern UI**: Glassmorphism, Colored Shadows, Soft Design  
✅ **AWS Deployment Ready**: ECS Fargate + RDS + S3 + CloudFront  

---

## 🛠 Công nghệ

### **Backend** (`ApexEV_BE`)
- **Framework**: Spring Boot 3.5.6 (Java 17+)
- **Database**: MySQL 8.0 / PostgreSQL
- **ORM**: JPA/Hibernate
- **Security**: Spring Security + JWT
- **AWS SDK**: S3 (v2.21.1), SNS (Email notifications)
- **Build Tool**: Maven
- **Architecture**: Controller → Service (Interface) → ServiceImpl → Repository → Entity

### **Frontend** (`ApexEV_FE`)
- **Framework**: React 18 + Vite
- **Routing**: React Router Dom v6
- **UI Library**: React Bootstrap 5
- **Icons**: Feather Icons (react-icons/fi), FontAwesome (react-icons/fa)
- **State Management**: Context API, Local State
- **Styling**: CSS Modules (BEM naming)
- **HTTP Client**: Axios

### **AWS Services**
- **Compute**: ECS Fargate (Docker containers)
- **Database**: RDS MySQL
- **Storage**: S3 (apexev-media bucket, public access)
- **CDN**: CloudFront (Frontend hosting)
- **Load Balancer**: Application Load Balancer (ALB)
- **Notifications**: SNS (Email via Lambda)
- **AI**: Bedrock (Claude 3.5 Sonnet) via Lambda + API Gateway
- **CI/CD**: GitLab CI/CD → ECR → ECS

---

## 🏗 Kiến trúc hệ thống


<img width="512" height="306" alt="image" src="https://github.com/user-attachments/assets/ceee187d-a13e-408c-bd43-1b203e4e1efb" />



### **Data Flow - Upload ảnh Checklist**:
1. **Technician** upload ảnh trong `JobList.jsx` → `POST /api/files/technician/upload`
2. **Backend** `S3Service` upload lên S3 → trả về `{s3Key, url}`
3. **Frontend** lưu `{url, s3Key}` vào state
4. **Technician** click Save → `POST /api/checklist/service-order/{id}/items/{itemId}/result` với `s3Key`
5. **Backend** lưu `s3Key` vào `ServiceChecklistResult.media_url` (database)

### **Data Flow - Customer xem ảnh**:
1. **Customer** vào `OrderDetail.jsx` → `GET /api/checklist/service-order/{id}/items`
2. **Backend** fetch `ServiceChecklistResult` → generate `mediaUrl` từ `s3Key` → trả về `{s3Key, mediaUrl, mediaType}`
3. **Frontend** hiển thị `<img src={item.mediaUrl} />`

---

## ✨ Tính năng

### 👤 **Customer (Khách hàng)**
- ✅ Đăng ký/Đăng nhập (JWT Authentication)
- ✅ Đặt lịch bảo dưỡng (chọn dịch vụ, ngày giờ, xe)
- ✅ Theo dõi tiến độ realtime (Timeline + Auto-refresh 5s)
- ✅ Xem kết quả kiểm tra chi tiết (OrderDetail)
  - Checklist items với status (PASSED/FAILED/NEEDS_ATTENTION)
  - Ảnh minh chứng từ kỹ thuật viên
  - Ghi chú kỹ thuật
- ✅ Xem hóa đơn (Invoice Preview)
- ✅ Đánh giá dịch vụ (Rating + Review)
- ✅ AI Chatbot hỗ trợ (AWS Bedrock Claude)

### 🔧 **Technician (Kỹ thuật viên)**
- ✅ Xem danh sách công việc (JobList)
- ✅ Tạo checklist từ template
- ✅ Kiểm tra từng hạng mục với status:
  - PASSED (Đạt)
  - FAILED (Không đạt)
  - NEEDS_ATTENTION (Cần lưu ý)
  - NEEDS_REPLACEMENT (Cần thay thế)
- ✅ Upload ảnh minh chứng lên S3
- ✅ Ghi chú kỹ thuật cho từng hạng mục
- ✅ Đánh dấu hoàn thành kiểm tra

### 📊 **Service Advisor (Cố vấn dịch vụ)**
- ✅ Quản lý đơn hàng (Dashboard)
- ✅ Tạo báo giá (Quotation)
- ✅ Xuất hóa đơn (Invoice)
- ✅ Giao tiếp với khách hàng (Notes)
- ✅ Phân công kỹ thuật viên

### 👨‍💼 **Admin (Quản lý)**
- ✅ Dashboard thống kê (Revenue, Orders, Services)
- ✅ Quản lý users (CRUD)
- ✅ Quản lý services (CRUD)
- ✅ Quản lý parts (Phụ tùng)
- ✅ Quản lý checklist templates

---

## 🚀 Cài đặt & Chạy

### **Prerequisites**
- Java 17+
- Node.js 18+
- MySQL 8.0 hoặc PostgreSQL
- Maven 3.8+
- Git

### **1. Clone Repository**
```bash
git clone https://gitlab.com/phamngoctrungnhan0901/apexev_project.git
cd apexev_project
```

### **2. Backend Setup**

```bash
cd ApexEV_BE/apexev

# Tạo database
mysql -u root -p
CREATE DATABASE apexev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Cấu hình application.properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Sửa database credentials, AWS credentials

# Build & Run
./mvnw clean package -DskipTests
java -jar target/apexev-0.0.1-SNAPSHOT.jar
```

Backend chạy tại: `http://localhost:8080`

### **3. Frontend Setup**

```bash
cd ApexEV_FE

# Install dependencies
npm install

# Tạo .env file
cp .env.example .env
# Sửa VITE_API_BASE_URL, VITE_AWS_AI_ENDPOINT

# Run dev server
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## ☁️ Deployment AWS

### **Architecture**
- **Frontend**: CloudFront + S3
- **Backend**: ECS Fargate (Docker) + ALB
- **Database**: RDS MySQL
- **Media Storage**: S3 (apexev-media)
- **CI/CD**: GitLab CI/CD → ECR → ECS

### **1. Backend Deployment**

#### **Build Docker Image**
```bash
cd ApexEV_BE/apexev

# Build image
docker build -t apexev-backend:latest .

# Test locally
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e AWS_S3_BUCKET=apexev-media \
  -e AWS_REGION=ap-southeast-1 \
  -e DB_HOST=your-rds-endpoint \
  -e DB_USER=admin \
  -e DB_PASSWORD=your-password \
  apexev-backend:latest
```

#### **Push to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin <ECR_URI>

# Tag & Push
docker tag apexev-backend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest
```

#### **Update ECS Service**
```bash
aws ecs update-service \
  --cluster apexev-cluster \
  --service apexev-service \
  --force-new-deployment \
  --region ap-southeast-1
```

### **2. Frontend Deployment**

```bash
cd ApexEV_FE

# Build production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://apexev-frontend-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

### **3. Environment Variables (ECS Task Definition)**

```json
{
  "containerDefinitions": [{
    "environment": [
      {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"},
      {"name": "AWS_S3_BUCKET", "value": "apexev-media"},
      {"name": "AWS_REGION", "value": "ap-southeast-1"},
      {"name": "DB_HOST", "value": "apexev-db.xxxx.rds.amazonaws.com"},
      {"name": "DB_PORT", "value": "3306"},
      {"name": "DB_NAME", "value": "apexev_db"},
      {"name": "DB_USER", "value": "admin"},
      {"name": "JWT_SECRET", "value": "your-secret-key-256-bit"}
    ]
  }]
}
```

**⚠️ Lưu ý**: 
- Database password nên lưu trong **AWS Secrets Manager** thay vì environment variables
- ECS Task Role phải có quyền: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`

---

## 📚 API Documentation

### **Base URL**
- Development: `http://localhost:8080/api`
- Production: `https://api.apexev.com/api`

### **Authentication**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "role": "CUSTOMER",
  "fullName": "Nguyễn Văn A"
}
```

### **File Upload (Technician)**
```http
POST /api/files/technician/upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

file: <binary>
folder: "technician"

Response:
{
  "s3Key": "technician/2024/12/abc123.jpg",
  "url": "https://apexev-media.s3.ap-southeast-1.amazonaws.com/technician/2024/12/abc123.jpg",
  "mediaType": "IMAGE",
  "fileName": "brake-check.jpg",
  "message": "Upload thành công"
}
```

### **Checklist Items (Customer View)**
```http
GET /api/checklist/service-order/{serviceOrderId}/items
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "isCompleted": true,
  "items": [
    {
      "serviceId": 1,
      "serviceName": "Bảo dưỡng định kỳ",
      "itemId": 10,
      "itemName": "Kiểm tra hệ thống phanh",
      "status": "PASSED",
      "technicianNotes": "Phanh hoạt động tốt",
      "s3Key": "technician/2024/12/abc123.jpg",
      "mediaUrl": "https://apexev-media.s3.ap-southeast-1.amazonaws.com/...",
      "mediaType": "IMAGE"
    }
  ]
}
```

**Xem full API docs**: `/swagger-ui.html` (khi chạy backend)

---

## 📁 Cấu trúc dự án

```
ApexEV_Project/
├── ApexEV_BE/                      # Backend Spring Boot
│   └── apexev/
│       ├── src/main/java/com/apexev/
│       │   ├── controller/         # REST Controllers
│       │   │   ├── FileUploadController.java
│       │   │   ├── ChecklistController.java
│       │   │   └── ...
│       │   ├── service/
│       │   │   ├── serviceImpl/    # Service implementations
│       │   │   │   ├── S3Service.java
│       │   │   │   ├── ChecklistService.java
│       │   │   │   └── ...
│       │   │   └── service_Interface/
│       │   ├── repository/         # JPA Repositories
│       │   ├── entity/             # JPA Entities
│       │   │   ├── ServiceChecklistResult.java
│       │   │   └── ...
│       │   ├── dto/                # Data Transfer Objects
│       │   │   ├── request/
│       │   │   └── response/
│       │   ├── config/             # Spring Configuration
│       │   │   ├── S3Config.java
│       │   │   ├── SecurityConfig.java
│       │   │   └── ...
│       │   └── enums/              # Enums
│       ├── src/main/resources/
│       │   ├── application.properties
│       │   └── application-prod.properties
│       ├── Dockerfile
│       ├── pom.xml
│       └── aws-deployment/         # AWS deployment scripts
│
├── ApexEV_FE/                      # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Reusable components
│   │   │   │   ├── AIChatbot.jsx
│   │   │   │   └── ...
│   │   │   ├── features/           # Feature-specific components
│   │   │   └── layout/             # Layout components
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── OrderTracking.jsx
│   │   │   │   ├── OrderDetail.jsx
│   │   │   │   └── ...
│   │   │   ├── technician/
│   │   │   │   ├── JobList.jsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── services/               # API services
│   │   │   ├── uploadService.js
│   │   │   ├── checklistService.js
│   │   │   └── ...
│   │   ├── context/                # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── constants/              # Constants
│   │   │   ├── roles.js
│   │   │   ├── routes.js
│   │   │   └── status.js
│   │   └── styles/                 # Global styles
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md                       # This file
```

---

## 🧪 Testing

### **Backend Tests**
```bash
cd ApexEV_BE/apexev
./mvnw test
```

### **Frontend Tests**
```bash
cd ApexEV_FE
npm test
```

---

## 🔐 Security

### **Authentication**
- JWT Token (256-bit secret)
- Token expiration: 24 hours
- Refresh token: Chưa implement (TODO)

### **Authorization**
- Role-based access control (RBAC)
- Roles: CUSTOMER, TECHNICIAN, SERVICE_ADVISOR, ADMIN
- Spring Security `@PreAuthorize` annotations

### **Data Protection**
- Password hashing: BCrypt
- HTTPS only in production
- CORS configuration for specific origins
- SQL Injection prevention: JPA Parameterized Queries
- XSS prevention: React auto-escaping

---

## 📊 Database Schema

### **Core Tables**
- `users` - User accounts (customers, technicians, advisors, admins)
- `vehicles` - Customer vehicles
- `maintenance_services` - Available services
- `service_orders` - Service bookings
- `service_order_items` - Services in each order

### **Checklist Tables**
- `checklist_templates` - Predefined checklist templates
- `checklist_template_items` - Items in templates
- `service_checklists` - Checklists for orders
- `service_checklist_items` - Master items for services
- `service_checklist_results` - Technician inspection results (có `media_url` column cho S3 key)

### **Other Tables**
- `invoices` - Invoices
- `parts` - Spare parts inventory
- `reviews` - Customer reviews
- `notifications` - System notifications

---

## 🐛 Troubleshooting

### **Backend không kết nối được S3**
- Kiểm tra AWS credentials: `aws configure list`
- Kiểm tra ECS Task Role có quyền S3
- Kiểm tra bucket name: `apexev-media` (không có typo)

### **Frontend không load được ảnh**
- Kiểm tra CORS của S3 bucket
- Kiểm tra `mediaUrl` trong API response
- Mở Console → Network → Check URL ảnh có đúng không

### **Database connection timeout**
- Kiểm tra RDS Security Group cho phép inbound từ ECS
- Kiểm tra DB credentials trong environment variables

---

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

---




