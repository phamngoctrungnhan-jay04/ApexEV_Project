package com.apexev.service.serviceImpl;

import com.apexev.dto.request.AssignShiftRequest;
import com.apexev.dto.request.CreateShiftRequest;
import com.apexev.dto.response.ShiftResponse;
import com.apexev.entity.*;
import com.apexev.enums.ShiftStatus;
import com.apexev.exception.ConflictException;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.hr.LeaveRequestRepository;
import com.apexev.repository.hr.ShiftAssignmentRepository;
import com.apexev.repository.hr.ShiftRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Transactional
    public ShiftResponse createShift(CreateShiftRequest request, Integer createdBy) {
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        Shift shift = new Shift();
        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setLocation(request.getLocation());
        shift.setDescription(request.getDescription());
        shift.setCreatedBy(createdBy);
        shift.setStatus(ShiftStatus.SCHEDULED);

        Shift saved = shiftRepository.save(shift);
        return mapToResponse(saved);
    }

    @Transactional
    public void assignStaff(AssignShiftRequest request, Integer assignedBy) {
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc"));

        for (Integer staffId : request.getStaffIds()) {
            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên ID: " + staffId));

            // Check conflicts
            checkStaffConflicts(staffId, shift.getStartTime(), shift.getEndTime());

            ShiftAssignment assignment = new ShiftAssignment();
            assignment.setShift(shift);
            assignment.setStaff(staff);
            assignment.setStatus(ShiftStatus.SCHEDULED);
            assignment.setNotes(request.getNotes());
            assignment.setAssignedBy(assignedBy);

            assignmentRepository.save(assignment);
        }
    }

    private void checkStaffConflicts(Integer staffId, LocalDateTime startTime, LocalDateTime endTime) {
        // Check shift conflicts
        List<ShiftAssignment> existingAssignments = 
                assignmentRepository.findStaffAssignmentsInTimeRange(staffId, startTime, endTime);
        if (!existingAssignments.isEmpty()) {
            throw new ConflictException("Nhân viên đã có ca làm việc trùng thời gian");
        }

        // Check leave conflicts
        LocalDate startDate = startTime.toLocalDate();
        LocalDate endDate = endTime.toLocalDate();
        List<LeaveRequest> approvedLeaves = 
                leaveRequestRepository.findApprovedLeavesInTimeRange(staffId, startDate, endDate);
        if (!approvedLeaves.isEmpty()) {
            throw new ConflictException("Nhân viên đã có đơn nghỉ phép được duyệt trong khoảng thời gian này");
        }
    }

    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ShiftResponse getShiftById(Integer shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc"));
        return mapToResponse(shift);
    }

    @Transactional
    public void deleteShift(Integer shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc"));
        shiftRepository.delete(shift);
    }

    private ShiftResponse mapToResponse(Shift shift) {
        ShiftResponse response = new ShiftResponse();
        response.setShiftId(shift.getShiftId());
        response.setName(shift.getName());
        response.setStartTime(shift.getStartTime());
        response.setEndTime(shift.getEndTime());
        response.setLocation(shift.getLocation());
        response.setStatus(shift.getStatus());
        response.setDescription(shift.getDescription());

        if (shift.getAssignments() != null) {
            List<ShiftResponse.StaffAssignmentResponse> assignments = shift.getAssignments().stream()
                    .map(a -> {
                        ShiftResponse.StaffAssignmentResponse ar = new ShiftResponse.StaffAssignmentResponse();
                        ar.setAssignmentId(a.getAssignmentId());
                        ar.setStaffId(a.getStaff().getUserId());
                        ar.setStaffName(a.getStaff().getFullName());
                        ar.setStatus(a.getStatus());
                        ar.setNotes(a.getNotes());
                        return ar;
                    })
                    .collect(Collectors.toList());
            response.setAssignments(assignments);
        }

        return response;
    }
}

