package com.apexev.service;

import com.apexev.dto.request.UserUpdateRequest;
import com.apexev.dto.response.UserResponse;
import com.apexev.entity.User;
import com.apexev.enums.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(String fullName, String email, String phone, String plainPassword, UserRole role);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserByPhone(String phone);
    Optional<User> getUserById(Integer id);
    List<UserResponse> getAllUsers(String fullName, String email, String phone,
                                   String roleStr, Boolean isActive,
                                   int pageNum, int pageSize, String sortStr);
    void updateUserId(Integer id, UserUpdateRequest userUpdateRequest);
    void updateUserStatus(Integer id, boolean isActive);
    void changePassword(Integer id, String oldPassword, String newPassword);
}
