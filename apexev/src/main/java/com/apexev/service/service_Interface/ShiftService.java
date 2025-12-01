package com.apexev.service.service_Interface;

import com.apexev.dto.request.AssignShiftRequest;
import com.apexev.dto.request.CreateShiftRequest;
import com.apexev.dto.response.ShiftResponse;

import java.util.List;

public interface ShiftService {
    ShiftResponse createShift(CreateShiftRequest request, Integer createdBy);

    void assignStaff(AssignShiftRequest request, Integer assignedBy);

    List<ShiftResponse> getAllShifts();

    ShiftResponse getShiftById(Integer shiftId);

    void deleteShift(Integer shiftId);
}
