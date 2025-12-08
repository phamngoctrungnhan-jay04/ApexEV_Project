# Hướng Dẫn Implement OTP Email Verification

## 🎯 Yêu Cầu
- Đăng ký → Gửi email với mã OTP 4 chữ số
- Người dùng nhập OTP → Verify
- Chỉ sau khi verify mới có thể đăng nhập
- OTP hết hạn sau 10 phút

---

## 📋 Các Bước Implement

### Bước 1: Cập nhật User Entity

User entity đã có các trường cần thiết:
```java
@Column(name = "email_verified")
private boolean emailVerified = false;

@Column(name = "email_verification_token", length = 255)
private String emailVerificationToken;

@Column(name = "email_verification_token_expiry")
private LocalDateTime emailVerificationTokenExpiry;
```

**Nếu chưa có, thêm vào User.java:**

```java
// Email verification fields
@Column(name = "email_verified")
private boolean emailVerified = false;

@Column(name = "email_verification_token", length = 255)
private String emailVerificationToken;

@Column(name = "email_verification_token_expiry")
private LocalDateTime emailVerificationTokenExpiry;
```

---

### Bước 2: Cập nhật UserServiceImpl

#### 2.1 Thêm method tạo OTP

```java
/**
 * Tạo mã OTP 4 chữ số
 */
private String generateOTP() {
    Random random = new Random();
    int otp = 1000 + random.nextInt(9000); // 1000-9999
    return String.valueOf(otp);
}
```

#### 2.2 Cập nhật registerUser method

```java
@Override
@Transactional
public User registerUser(String fullName, String email, String phone, String plainPassword, UserRole role) {
    if (userRepository.existsByEmail(email)) {
        throw new UserAlreadyExistsException("email", "User with this email already exists");
    }
    if (userRepository.existsByPhone(phone)) {
        throw new UserAlreadyExistsException("phone", "User with this phone already exists");
    }

    User newUser = new User();
    newUser.setFullName(fullName);
    newUser.setEmail(email);
    newUser.setPhone(phone);
    newUser.setPasswordHash(passwordEncoder.encode(plainPassword));
    newUser.setRole(role);
    newUser.setActive(true); // Tài khoản active nhưng email chưa verify
    newUser.setEmailVerified(false); // Email chưa xác nhận

    // Lưu user trước
    User savedUser = userRepository.save(newUser);

    // Tạo OTP 4 chữ số
    String otp = generateOTP();
    savedUser.setEmailVerificationToken(otp);
    savedUser.setEmailVerificationTokenExpiry(LocalDateTime.now().plusMinutes(10)); // OTP hết hạn sau 10 phút
    userRepository.save(savedUser);

    // Gửi email xác nhận với mã OTP
    try {
        snsEmailService.sendRegistrationConfirmationEmail(email, fullName, otp);
        log.info("OTP email sent to: {}", email);
    } catch (Exception e) {
        log.error("Error sending OTP email to: {}", email, e);
        throw new RuntimeException("Failed to send verification email. Please try again later.");
    }

    // Bắn event
    try {
        publisher.publishEvent(new UserRegisterEvent(savedUser));
    } catch (Exception e) {
        log.error("Error publishing UserRegisterEvent for user: {}", savedUser.getEmail(), e);
    }

    return savedUser;
}
```

#### 2.3 Thêm method verify OTP

```java
/**
 * Xác nhận email bằng OTP
 */
@Transactional
public User verifyEmailWithOTP(String email, String otp) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    // Kiểm tra OTP
    if (!otp.equals(user.getEmailVerificationToken())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
    }

    // Kiểm tra OTP hết hạn
    if (LocalDateTime.now().isAfter(user.getEmailVerificationTokenExpiry())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired");
    }

    // Xác nhận email
    user.setEmailVerified(true);
    user.setEmailVerificationToken(null);
    user.setEmailVerificationTokenExpiry(null);
    userRepository.save(user);

    log.info("Email verified successfully for user: {}", email);
    return user;
}

/**
 * Gửi lại OTP
 */
@Transactional
public void resendOTP(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if (user.isEmailVerified()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already verified");
    }

    // Tạo OTP mới
    String otp = generateOTP();
    user.setEmailVerificationToken(otp);
    user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusMinutes(10));
    userRepository.save(user);

    // Gửi email
    try {
        snsEmailService.sendRegistrationConfirmationEmail(email, user.getFullName(), otp);
        log.info("OTP resent to: {}", email);
    } catch (Exception e) {
        log.error("Error resending OTP to: {}", email, e);
        throw new RuntimeException("Failed to resend OTP. Please try again later.");
    }
}
```

---

### Bước 3: Cập nhật UserService Interface

```java
public interface UserService {
    // ... existing methods ...
    
    /**
     * Xác nhận email bằng OTP
     */
    User verifyEmailWithOTP(String email, String otp);
    
    /**
     * Gửi lại OTP
     */
    void resendOTP(String email);
}
```

---

### Bước 4: Cập nhật AuthController

```java
@PostMapping("/verify-otp")
public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    String otp = request.get("otp");
    
    if (email == null || email.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
    }
    if (otp == null || otp.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
    }
    
    try {
        userService.verifyEmailWithOTP(email, otp);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now login."));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

@PostMapping("/resend-otp")
public ResponseEntity<?> resendOTP(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    
    if (email == null || email.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
    }
    
    try {
        userService.resendOTP(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully!"));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```

---

### Bước 5: Cập nhật Login Logic

Trong AuthController, thêm kiểm tra email verified:

```java
@PostMapping("/login")
public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
        // Tìm user
        User user = userRepository.findByEmail(loginRequest.getEmailOrPhone())
                .orElseGet(() -> userRepository.findByPhone(loginRequest.getEmailOrPhone())
                        .orElse(null));
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }
        
        // Kiểm tra email verified
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Email not verified. Please verify your email first."));
        }
        
        // Tiếp tục login bình thường
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmailOrPhone(),
                        loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);

        return ResponseEntity.ok(new LoginSuccessResponse(
                accessToken,
                refreshToken,
                "Bearer",
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getPhone(),
                userDetails.getFullName(),
                userDetails.getAuthorities().iterator().next().getAuthority()));
    } catch (BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
    }
}
```

---

### Bước 6: Cập nhật SNSEmailService

Sửa method `sendRegistrationConfirmationEmail` để gửi OTP thay vì link:

```java
/**
 * Gửi email xác nhận đăng ký với OTP
 */
public void sendRegistrationConfirmationEmail(String email, String fullName, String otp) {
    Map<String, Object> emailData = new HashMap<>();
    emailData.put("type", "REGISTRATION_CONFIRMATION");
    emailData.put("email", email);
    emailData.put("fullName", fullName);
    emailData.put("otp", otp); // Thay vì confirmationLink
    emailData.put("subject", "Xác nhận đăng ký tài khoản ApexEV");

    publishEmailEvent(emailData);
}
```

---

### Bước 7: Cập nhật Lambda Email Template

Sửa template REGISTRATION_CONFIRMATION trong `lambda_email_handler.py`:

```python
'REGISTRATION_CONFIRMATION': {
    'subject': 'Xác nhận đăng ký tài khoản ApexEV',
    'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .otp-box {{ background-color: #e7f3ff; border: 2px solid #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }}
        .otp {{ font-size: 48px; font-weight: bold; color: #007bff; letter-spacing: 10px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ApexEV - Xác nhận tài khoản</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản ApexEV!</p>
            <p>Để hoàn tất quá trình đăng ký, vui lòng nhập mã OTP dưới đây:</p>
            <div class="otp-box">
                <div class="otp">{otp}</div>
            </div>
            <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    '''
}
```

---

## 🔄 Quy Trình Hoàn Chỉnh

```
1. Người dùng đăng ký
   ↓
2. Spring Boot tạo OTP 4 chữ số
   ↓
3. Gửi email với OTP qua SNS → Lambda → SES
   ↓
4. Người dùng nhận email
   ↓
5. Người dùng nhập OTP vào app
   ↓
6. App gọi POST /api/auth/verify-otp
   ↓
7. Spring Boot kiểm tra OTP
   ↓
8. Nếu đúng → Đánh dấu email verified
   ↓
9. Người dùng có thể đăng nhập
```

---

## 📱 API Endpoints

### 1. Đăng ký
```
POST /api/auth/register
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "password123"
}

Response:
{
  "message": "Registration successful! Please check your email for OTP."
}
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "1234"
}

Response:
{
  "message": "Email verified successfully! You can now login."
}
```

### 3. Gửi lại OTP
```
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent successfully!"
}
```

### 4. Đăng nhập
```
POST /api/auth/login
{
  "emailOrPhone": "user@example.com",
  "password": "password123"
}

Response (nếu email chưa verify):
{
  "error": "Email not verified. Please verify your email first."
}

Response (nếu email đã verify):
{
  "accessToken": "...",
  "refreshToken": "...",
  "type": "Bearer",
  ...
}
```

---

## 📋 Checklist

- [ ] Cập nhật User entity (nếu chưa có)
- [ ] Thêm method `generateOTP()` vào UserServiceImpl
- [ ] Cập nhật `registerUser()` method
- [ ] Thêm method `verifyEmailWithOTP()`
- [ ] Thêm method `resendOTP()`
- [ ] Cập nhật UserService interface
- [ ] Thêm endpoints `/verify-otp` và `/resend-otp` vào AuthController
- [ ] Cập nhật login logic để kiểm tra email verified
- [ ] Cập nhật SNSEmailService
- [ ] Cập nhật Lambda email template
- [ ] Test đăng ký → Verify OTP → Đăng nhập

---

## 🧪 Test

### 1. Đăng ký
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "password123"
  }'
```

### 2. Kiểm tra email nhận OTP

### 3. Verify OTP
```bash
curl -X POST http://localhost:8081/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "1234"
  }'
```

### 4. Đăng nhập
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "password123"
  }'
```

---

## 📚 Tham Khảo

- [Spring Security](https://spring.io/projects/spring-security)
- [JPA Transactions](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
- [LocalDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html)
