package com.apexev.service.service_Interface;

import com.apexev.dto.request.UpdateStaffProfileRequest;
import com.apexev.dto.response.StaffProfileResponse;

import java.util.List;

public interface EmployeeService {
    List<StaffProfileResponse> getAllStaff();

    StaffProfileResponse getStaffById(Integer staffId);

    StaffProfileResponse updateStaffProfile(Integer staffId, UpdateStaffProfileRequest request);
}
