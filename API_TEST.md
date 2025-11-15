# API Testing Guide

## Backend Status
- **Backend URL**: http://localhost:8081
- **API Base**: http://localhost:8081/api/auth
- **Database**: MySQL 9.5 (apexev database with 19 tables)
- **User**: apexev_user / Password: 123456

## Authentication APIs

### 1. Register API
**Endpoint**: `POST http://localhost:8081/api/auth/register`

**Request Body**:
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "test@example.com",
  "phone": "0123456789",
  "password": "123456",
  "role": "CUSTOMER"
}
```

**Success Response**:
```json
{
  "message": "Đăng ký thành công!"
}
```

**Error Response**:
```json
{
  "error": "Email đã tồn tại"
}
```

---

### 2. Login API
**Endpoint**: `POST http://localhost:8081/api/auth/login`

**Request Body**:
```json
{
  "emailOrPhone": "test@example.com",
  "password": "123456"
}
```

**Success Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "test@example.com",
  "phone": "0123456789",
  "fullName": "Nguyễn Văn A",
  "userRole": "ROLE_CUSTOMER"
}
```

**Error Response**:
```json
{
  "error": "Thông tin đăng nhập không đúng!"
}
```

---

### 3. Refresh Token API
**Endpoint**: `POST http://localhost:8081/api/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

---

## Frontend Integration

### Field Mapping
Backend → Frontend:
- `userId` → `id`
- `userRole` → `role`
- `ROLE_CUSTOMER` → `customer`
- `ROLE_TECHNICIAN` → `technician`
- `ROLE_SERVICE_ADVISOR` → `advisor`
- `ROLE_BUSINESS_MANAGER` → `manager`

### Updated Files
1. ✅ `src/services/authService.js` - Maps backend fields to frontend format
2. ✅ `src/context/AuthContext.jsx` - Normalizes role names
3. ✅ `src/pages/auth/LoginPage.jsx` - Already using authService
4. ✅ `src/pages/auth/RegisterPage.jsx` - Already using authService

---

## Testing Steps

### 1. Test Register
1. Go to http://localhost:5173/register
2. Fill in form with test data
3. Click "Đăng ký"
4. Should see success message and redirect to dashboard

### 2. Test Login
1. Go to http://localhost:5173/login
2. Use registered email/phone and password
3. Click "Đăng nhập"
4. Should receive JWT tokens and redirect based on role

### 3. Check Browser Console
Open DevTools → Console to see:
- API request/response
- Any errors
- Token storage in localStorage

### 4. Check Network Tab
Open DevTools → Network to verify:
- Request URL: http://localhost:8081/api/auth/login
- Status Code: 200 (success) or 401 (unauthorized)
- Response body contains tokens

---

## Common Issues

### CORS Error
If you see CORS error, backend already has `@CrossOrigin(origins = "*")` in AuthController.

### Network Error
- Check if backend is running: http://localhost:8081
- Check if MySQL is running
- Verify no firewall blocking port 8081

### Authentication Error
- Verify email/phone exists in database
- Check password is correct
- Look for error message in response

---

## Next Steps
After successful login/register:
1. Test protected routes (Customer Dashboard, Technician Dashboard)
2. Test API calls with JWT token
3. Test token refresh mechanism
4. Test logout functionality
