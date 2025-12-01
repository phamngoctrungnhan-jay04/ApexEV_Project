package com.apexev.service.serviceImpl;

import com.apexev.dto.request.coreBussinessRequest.UpdateStaffProfileRequest;
import com.apexev.dto.response.coreBussinessResponse.StaffProfileResponse;
import com.apexev.entity.StaffProfile;
import com.apexev.entity.User;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.userAndVehicle.StaffRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;

    public List<StaffProfileResponse> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StaffProfileResponse getStaffById(Integer staffId) {
        StaffProfile profile = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhân viên"));
        return mapToResponse(profile);
    }

    @Transactional
    public StaffProfileResponse updateStaffProfile(Integer staffId, UpdateStaffProfileRequest request) {
        StaffProfile profile = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhân viên"));



        if (request.getHireDate() != null) {
            profile.setHireDate(request.getHireDate());
        }
        if (request.getAnnualLeaveBalance() != null) {
            profile.setAnnualLeaveBalance(request.getAnnualLeaveBalance());
        }
        if (request.getSickLeaveBalance() != null) {
            profile.setSickLeaveBalance(request.getSickLeaveBalance());
        }
        if (request.getIsActive() != null) {
            profile.setIsActive(request.getIsActive());
        }

        StaffProfile saved = staffRepository.save(profile);
        return mapToResponse(saved);
    }

    private StaffProfileResponse mapToResponse(StaffProfile profile) {
        StaffProfileResponse response = new StaffProfileResponse();
        response.setUserId(profile.getId());
        
        User user = profile.getUser();
        if (user != null) {
            response.setFullName(user.getFullName());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
        }
        
        response.setEmployeeCode(profile.getEmployeeCode());



        
        response.setHireDate(profile.getHireDate());
        response.setAnnualLeaveBalance(profile.getAnnualLeaveBalance());
        response.setSickLeaveBalance(profile.getSickLeaveBalance());
        response.setIsActive(profile.getIsActive());
        
        return response;
    }
}

