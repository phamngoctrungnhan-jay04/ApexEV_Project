package com.apexev.service.service_Interface;

import com.apexev.dto.request.coreBussinessRequest.AssignShiftRequest;
import com.apexev.dto.request.coreBussinessRequest.CreateShiftRequest;
import com.apexev.dto.response.coreBussinessResponse.ShiftResponse;

import java.util.List;

public interface ShiftService {
    ShiftResponse createShift(CreateShiftRequest request, Integer createdBy);

    void assignStaff(AssignShiftRequest request, Integer assignedBy);

    List<ShiftResponse> getAllShifts();

    ShiftResponse getShiftById(Integer shiftId);

    void deleteShift(Integer shiftId);
}
