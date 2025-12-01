package com.apexev.service.serviceImpl;

import com.apexev.dto.request.coreBussinessRequest.ApproveLeaveRequest;
import com.apexev.dto.request.coreBussinessRequest.CreateLeaveRequestRequest;
import com.apexev.dto.response.coreBussinessResponse.LeaveRequestResponse;
import com.apexev.entity.LeaveRequest;
import com.apexev.entity.LeaveType;
import com.apexev.entity.StaffProfile;
import com.apexev.entity.User;
import com.apexev.enums.LeaveStatus;
import com.apexev.exception.ConflictException;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.hr.LeaveRequestRepository;
import com.apexev.repository.hr.LeaveTypeRepository;
import com.apexev.repository.hr.ShiftAssignmentRepository;
import com.apexev.repository.userAndVehicle.StaffRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final ShiftAssignmentRepository assignmentRepository;

    @Transactional
    public LeaveRequestResponse createLeaveRequest(CreateLeaveRequestRequest request) {
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên"));

        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại nghỉ phép"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        // Check leave balance
        StaffProfile profile = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhân viên"));

        if ("ANNUAL".equals(leaveType.getCode()) && profile.getAnnualLeaveBalance() < totalDays) {
            throw new ConflictException("Số ngày phép năm không đủ");
        }
        if ("SICK".equals(leaveType.getCode()) && profile.getSickLeaveBalance() < totalDays) {
            throw new ConflictException("Số ngày phép ốm không đủ");
        }

        // Check overlapping shifts
        List<?> overlaps = assignmentRepository.findStaffAssignmentsInTimeRange(
                request.getStaffId(),
                request.getStartDate().atStartOfDay(),
                request.getEndDate().atTime(23, 59, 59)
        );
        if (!overlaps.isEmpty()) {
            throw new ConflictException("Có ca làm việc trùng với thời gian xin nghỉ");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setStaff(staff);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setTotalDays((int) totalDays);
        leaveRequest.setReason(request.getReason());
        leaveRequest.setDocumentUrl(request.getDocumentUrl());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public LeaveRequestResponse approveLeaveRequest(Integer leaveRequestId, ApproveLeaveRequest request, Integer approverId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn xin nghỉ"));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người duyệt"));

        if (request.getApproved()) {
            leaveRequest.setStatus(LeaveStatus.APPROVED);
            leaveRequest.setApprovedAt(LocalDateTime.now());
            
            // Deduct leave balance
            StaffProfile profile = staffRepository.findById(leaveRequest.getStaff().getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhân viên"));
            
            if ("ANNUAL".equals(leaveRequest.getLeaveType().getCode())) {
                profile.setAnnualLeaveBalance(profile.getAnnualLeaveBalance() - leaveRequest.getTotalDays());
            } else if ("SICK".equals(leaveRequest.getLeaveType().getCode())) {
                profile.setSickLeaveBalance(profile.getSickLeaveBalance() - leaveRequest.getTotalDays());
            }
            staffRepository.save(profile);
        } else {
            leaveRequest.setStatus(LeaveStatus.REJECTED);
            leaveRequest.setRejectionReason(request.getRejectionReason());
        }

        leaveRequest.setApprover(approver);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    public List<LeaveRequestResponse> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestResponse> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest lr) {
        LeaveRequestResponse response = new LeaveRequestResponse();
        response.setLeaveRequestId(lr.getLeaveRequestId());
        response.setStaffId(lr.getStaff().getUserId());
        response.setStaffName(lr.getStaff().getFullName());
        response.setLeaveTypeName(lr.getLeaveType().getName());
        response.setStartDate(lr.getStartDate());
        response.setEndDate(lr.getEndDate());
        response.setTotalDays(lr.getTotalDays());
        response.setStatus(lr.getStatus());
        response.setReason(lr.getReason());
        response.setDocumentUrl(lr.getDocumentUrl());
        if (lr.getApprover() != null) {
            response.setApproverName(lr.getApprover().getFullName());
        }
        response.setApprovedAt(lr.getApprovedAt());
        response.setRejectionReason(lr.getRejectionReason());
        response.setCreatedAt(lr.getCreatedAt());
        return response;
    }
}

