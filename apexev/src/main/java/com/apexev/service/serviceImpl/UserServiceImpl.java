package com.apexev.service.serviceImpl;

import com.apexev.dto.request.userAndVehicleRequest.UpdateProfileRequest;
import com.apexev.dto.request.userAndVehicleRequest.UserUpdateRequest;
import com.apexev.dto.response.userAndVehicleResponse.UserResponse;
import com.apexev.entity.User;
import com.apexev.enums.UserRole;
import com.apexev.exception.UserAlreadyExistsException;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
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
        newUser.setActive(true);

        return userRepository.save(newUser);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findByUserId(id);
    }

    @Override
    public List<UserResponse> getAllUsers(String fullName, String email, String phone,
            String roleStr, Boolean isActive,
            int pageNum, int pageSize, String sortStr) {
        Specification<User> spec = Specification.where(null);

        if (fullName != null && !fullName.isEmpty()) {
            spec = spec.and(
                    (root, query, cb) -> cb.like(cb.lower(root.get("fullName")), "%" + fullName.toLowerCase() + "%"));
        }
        if (email != null && !email.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
        }
        if (phone != null && !phone.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("phone"), phone));
        }
        if (roleStr != null && !roleStr.isEmpty()) {
            try {
                UserRole role = UserRole.valueOf(roleStr.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role: {}", roleStr);
            }
        }
        if (isActive != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), isActive));
        }

        // Sorting
        String[] sortDetails = sortStr.split(",");
        String sortByProperty = sortDetails[0];
        Sort.Direction sortDirection = (sortDetails.length > 1 && "desc".equalsIgnoreCase(sortDetails[1]))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(sortDirection, sortByProperty));
        Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Helper method để convert Entity -> DTO an toàn (Tránh lỗi Hibernate
    // Proxy/Loop)
    private UserResponse convertToDto(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        dto.setIsActive(user.isActive());
        // Map các trường bổ sung
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());
        dto.setAddress(user.getAddress());
        return dto;
    }

    public void updateUserId(Integer id, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (userUpdateRequest.getFullName() != null) {
            user.setFullName(userUpdateRequest.getFullName());
        }

        // Check trùng Email (chỉ check khi email thay đổi)
        if (userUpdateRequest.getEmail() != null && !userUpdateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userUpdateRequest.getEmail())) {
                throw new UserAlreadyExistsException("email", "User with this email already exists");
            }
            user.setEmail(userUpdateRequest.getEmail());
        }

        // Check trùng Phone (chỉ check khi phone thay đổi)
        if (userUpdateRequest.getPhone() != null && !userUpdateRequest.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(userUpdateRequest.getPhone())) {
                throw new UserAlreadyExistsException("phone", "User with this phone already exists");
            }
            user.setPhone(userUpdateRequest.getPhone());
        }

        userRepository.save(user);
    }

    public void updateUserStatus(Integer id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(isActive);
        userRepository.save(user);
    }

    public void changePassword(Integer id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không đúng");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserResponse getMyProfile(User loggedInUser) {
        // Lấy lại user từ DB để đảm bảo dữ liệu mới nhất
        User user = userRepository.findById(loggedInUser.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return convertToDto(user);
    }

    @Override
    public UserResponse updateMyProfile(User loggedInUser, UpdateProfileRequest request) {
        log.info("Updating profile for user ID: {}", loggedInUser.getUserId());

        // 1. Lấy User từ DB (Quan trọng: Không dùng trực tiếp loggedInUser để save)
        User currentUser = userRepository.findById(loggedInUser.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Kiểm tra trùng Email
        if (request.getEmail() != null && !request.getEmail().equals(currentUser.getEmail())) {
            Optional<User> userByEmail = userRepository.findByEmail(request.getEmail());
            if (userByEmail.isPresent()) {
                throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác.");
            }
            currentUser.setEmail(request.getEmail());
        }

        // 3. Kiểm tra trùng SĐT
        if (request.getPhone() != null && !request.getPhone().equals(currentUser.getPhone())) {
            Optional<User> userByPhone = userRepository.findByPhone(request.getPhone());
            if (userByPhone.isPresent()) {
                throw new IllegalArgumentException("Số điện thoại này đã được sử dụng bởi tài khoản khác.");
            }
            currentUser.setPhone(request.getPhone());
        }

        // 4. Cập nhật thông tin khác
        if (request.getFullName() != null)
            currentUser.setFullName(request.getFullName());
        if (request.getDateOfBirth() != null)
            currentUser.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)
            currentUser.setGender(request.getGender());
        if (request.getAddress() != null)
            currentUser.setAddress(request.getAddress());

        // 5. Lưu vào DB
        User updatedUser = userRepository.save(currentUser);
        log.info("Profile updated successfully for user ID: {}", updatedUser.getUserId());

        // 6. Map và trả về
        return convertToDto(updatedUser);
    }
}