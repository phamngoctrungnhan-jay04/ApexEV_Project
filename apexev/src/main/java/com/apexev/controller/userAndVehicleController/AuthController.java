package com.apexev.controller.userAndVehicleController;

import com.apexev.dto.request.userAndVehicleRequest.LoginRequest;
import com.apexev.dto.request.userAndVehicleRequest.RefreshRequest;
import com.apexev.dto.request.userAndVehicleRequest.RegisterRequest;
import com.apexev.dto.request.RegisterStaffRequest;
import com.apexev.dto.response.userAndVehicleResponse.LoginSuccessResponse;
import com.apexev.enums.UserRole;
import com.apexev.security.jwt.JwtUtils;
import com.apexev.security.services.UserDetailsImpl;
import com.apexev.security.services.UserDetailsServiceImpl;
import com.apexev.service.service_Interface.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @PostMapping("/register-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerStaff(@RequestBody @Valid RegisterStaffRequest request) {
        UserRole role = UserRole.valueOf(request.getRole());
        userService.registerUser(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                role);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        UserRole role = UserRole.valueOf("CUSTOMER");
        userService.registerUser(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                role
        );
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody com.apexev.dto.request.userAndVehicleRequest.VerifyEmailRequest request) {
        try {
            userService.verifyEmailWithOTP(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now login."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@Valid @RequestBody com.apexev.dto.request.userAndVehicleRequest.ResendOTPRequest request) {
        try {
            userService.resendOTP(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmailOrPhone(),
                            loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Kiểm tra email verified
            com.apexev.entity.User user = userService.getUserByEmail(userDetails.getEmail())
                    .orElseGet(() -> userService.getUserByPhone(userDetails.getPhone()).orElse(null));

            if (user != null && !user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Email not verified. Please verify your email first."));
            }

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
            // Trả về JSON lỗi
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Thông tin đăng nhập không đúng!"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshRequest req) {
        String refreshToken = req.getRefreshToken();
        if (jwtUtils.validateJwtToken(refreshToken)) {
            Integer userId = jwtUtils.getUserIdFromJwtToken(refreshToken);
            // Lấy UserDetails từ username
            UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsServiceImpl.loadUserById(userId);

            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
                    userDetails.getAuthorities());
            String newAccessToken = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(Map.of("accessToken", newAccessToken, "type", "Bearer"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid refresh token"));
        }
    }

}