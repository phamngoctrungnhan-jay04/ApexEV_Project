package com.apexev.controller.userAndVehicleController;

import com.apexev.dto.request.userAndVehicleRequest.UpdateProfileRequest;
import com.apexev.dto.response.userAndVehicleResponse.UserResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-profile")
public class ProfileController {
    private final UserService userService;

    // lấy hồ sơ của tôi
    @GetMapping("/myProfile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu chỉ cần đăng nhập
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal User loggedInUser
    ) {
        return ResponseEntity.ok(userService.getMyProfile(loggedInUser));
    }

    // cập nhật hồ sơ của tôi
    @PutMapping("/myProfile-update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User loggedInUser
    ) {
        UserResponse updatedUser = userService.updateMyProfile(loggedInUser, request);
        return ResponseEntity.ok(updatedUser);
    }
}
