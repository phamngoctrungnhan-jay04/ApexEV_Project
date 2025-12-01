package com.apexev.service.service_Interface;

import com.apexev.dto.request.ApproveLeaveRequest;
import com.apexev.dto.request.CreateLeaveRequestRequest;
import com.apexev.dto.response.LeaveRequestResponse;

import java.util.List;

public interface LeaveService {
    LeaveRequestResponse createLeaveRequest(CreateLeaveRequestRequest request);

    LeaveRequestResponse approveLeaveRequest(Integer leaveRequestId, ApproveLeaveRequest request, Integer approverId);

    List<LeaveRequestResponse> getAllLeaveRequests();

    List<LeaveRequestResponse> getPendingLeaveRequests();
}
