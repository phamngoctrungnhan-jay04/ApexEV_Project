package com.apexev.service.service_Interface;

import com.apexev.dto.request.technicianRequest.AddTechnicianNotesRequest;
import com.apexev.dto.request.technicianRequest.UpdateWorkStatusRequest;
import com.apexev.dto.response.technicianResponse.TechnicianWorkDetailResponse;
import com.apexev.dto.response.technicianResponse.TechnicianWorkResponse;
import com.apexev.entity.User;

import java.util.List;

public interface TechnicianWorkService {
    // Lấy danh sách công việc được giao cho technician
    List<TechnicianWorkResponse> getMyAssignedWorks(User technician);
    
    // Xem chi tiết 1 công việc
    TechnicianWorkDetailResponse getWorkDetail(Long workId, User technician);
    
    // Cập nhật trạng thái công việc
    TechnicianWorkDetailResponse updateWorkStatus(Long workId, UpdateWorkStatusRequest request, User technician);
    
    // Thêm/cập nhật ghi chú kỹ thuật viên
    TechnicianWorkDetailResponse addTechnicianNotes(Long workId, AddTechnicianNotesRequest request, User technician);
}
