# Sửa lỗi không xem được báo cáo kiểm tra chi tiết trên AWS

## Nguyên nhân
Biến môi trường `VITE_API_URL` chưa được cấu hình đúng khi deploy lên AWS, khiến Frontend gọi sai endpoint API.

## Giải pháp

### 1. Tạo file `.env.production` trong thư mục root FE

```bash
# File: ApexEV_FE/.env.production
VITE_API_URL=https://api.regenzet.io.vn
```

**Lưu ý:** Thay `https://api.regenzet.io.vn` bằng URL backend thực tế của bạn trên AWS.

### 2. Build lại Frontend với biến môi trường production

```bash
cd ApexEV_FE
npm run build
```

Vite sẽ tự động load file `.env.production` khi build cho production.

### 3. Kiểm tra build output

Sau khi build, kiểm tra file `dist/assets/index-*.js` xem có chứa URL đúng không:

```bash
grep -r "api.regenzet.io.vn" dist/
```

### 4. Deploy lại lên AWS

Upload lại thư mục `dist/` lên S3 hoặc host tĩnh của bạn.

## Kiểm tra trên production

1. Mở DevTools Console (F12)
2. Vào trang Chi tiết công việc
3. Xem logs:
   - `🌐 [checklistService] Calling API: ...` → Kiểm tra URL có đúng không
   - `✅ [checklistService] API Success` → API thành công
   - `❌ [checklistService] ... error` → Xem chi tiết lỗi

## Các lỗi thường gặp

### Lỗi CORS
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```
**Giải pháp:** Cấu hình CORS trên Backend Spring Boot:
- Thêm origin: `https://regenzet.io.vn` vào `@CrossOrigin`
- Hoặc cấu hình WebMvcConfigurer

### Lỗi 404 Not Found
```
❌ Error details: { status: 404, url: "..." }
```
**Giải pháp:** 
- Kiểm tra endpoint backend có đúng không
- Kiểm tra backend có deploy đúng không

### Lỗi 401 Unauthorized
```
❌ Error details: { status: 401 }
```
**Giải pháp:**
- Token hết hạn → Đăng xuất và đăng nhập lại
- Kiểm tra JWT secret trên backend

## File cần kiểm tra

### Frontend
- `ApexEV_FE/.env.production` ← **Quan trọng nhất**
- `ApexEV_FE/src/services/checklistService.js` (line 3)
- `ApexEV_FE/src/pages/customer/OrderDetail.jsx`

### Backend
- `application.properties` hoặc `application.yml`
- CORS configuration
- Controller endpoint: `/api/checklist/service-order/{orderId}/items`

## Console logs để debug

Sau khi fix, bạn sẽ thấy logs như sau trong DevTools:

```
🔄 [OrderDetail] Fetching checklist for orderId: 37
🌐 [checklistService] Calling API: https://api.regenzet.io.vn/api/checklist/service-order/37/items
🔑 [checklistService] Auth header: { Authorization: "Bearer eyJ..." }
✅ [checklistService] API Success: 200 [{...}]
🔍 [Customer OrderDetail] Fetched data: {...}
```

Nếu thấy `http://localhost:8081` thay vì `https://api.regenzet.io.vn` → Chưa set biến môi trường đúng.
