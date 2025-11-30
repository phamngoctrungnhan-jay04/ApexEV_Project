package com.apexev.controller.userAndVehicleController;

import com.apexev.dto.request.userAndVehicleRequest.UpdateProfileRequest;
import com.apexev.dto.response.userAndVehicleResponse.UserResponse;
import com.apexev.dto.response.ApiResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.web.server.ResponseStatusException;
import com.apexev.enums.UserRole;
import com.apexev.repository.userAndVehicle.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-profile")
public class ProfileController {
    private final UserService userService;
    private final UserRepository userRepository;

    // lấy hồ sơ của tôi
    @GetMapping("/myProfile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu chỉ cần đăng nhập
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal User loggedInUser) {
        return ResponseEntity.ok(userService.getMyProfile(loggedInUser));
    }

    // cập nhật hồ sơ của tôi
    @PutMapping("/myProfile-update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User loggedInUser) {
        UserResponse updatedUser = userService.updateMyProfile(loggedInUser, request);
        return ResponseEntity.ok(updatedUser);
    }

    // API lấy danh sách tài khoản theo role (cho Admin, Manager, Service Advisor)
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SERVICE_ADVISOR')")
    public ResponseEntity<?> getUserListByRole(
            @RequestParam("role") String role,
            @RequestParam(value = "pageNum", defaultValue = "0") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "100") int pageSize) {
        try {
            var users = userService.getAllUsers(null, null, null, role, null, pageNum, pageSize, "fullName,asc");
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Lấy danh sách tài khoản thành công", users));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(
                    new ApiResponse<>(false, "Lỗi lấy danh sách tài khoản: " + e.getMessage(), null));
        }
    }

    // API bật/tắt hoạt động tài khoản
    @PutMapping("/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserActive(@RequestBody Map<String, Object> req) {
        Integer userId = (Integer) req.get("userId");
        Boolean isActive = (Boolean) req.get("isActive");
        userService.updateUserStatus(userId, isActive);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", null));
    }

    // API đổi vai trò tài khoản
    @PutMapping("/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@RequestBody Map<String, Object> req) {
        Integer userId = (Integer) req.get("userId");
        String newRole = (String) req.get("newRole");
        var user = userService.getUserById(userId)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND));
        user.setRole(UserRole.valueOf(newRole));
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật vai trò thành công", null));
    }

    // API xóa tài khoản
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String, Object> req) {
        Integer userId = (Integer) req.get("userId");
        userRepository.deleteById(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa tài khoản thành công", null));
    }
}
