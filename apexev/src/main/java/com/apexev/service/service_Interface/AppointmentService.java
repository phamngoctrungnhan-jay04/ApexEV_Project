package com.apexev.service.service_Interface;

import com.apexev.dto.request.coreBussinessRequest.AppointmentRequest;
import com.apexev.dto.request.coreBussinessRequest.AssignTechnicianRequest;
import com.apexev.dto.request.coreBussinessRequest.RescheduleAppointmentRequest;
import com.apexev.dto.response.coreBussinessResponse.AppointmentResponse;
import com.apexev.entity.User;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request, User loggedInUser);

    // khách hàng dời lịch
    AppointmentResponse rescheduleAppointment(Long appointmentId, RescheduleAppointmentRequest request,
            User loggedInUser);

    AppointmentResponse cancelAppointment(Long appointmentId, User loggedInUser);

    // cố vấn dịch vụ xác nhận lịch hẹn, kiểu gọi điện xác nhận xong rồi mới confirm
    AppointmentResponse confirmAppointment(Long appointmentId, User loggedInUser);

    // các hàm xem lịch hẹn
    AppointmentResponse getAppointmentById(Long appointmentId, User loggedInUser);

    List<AppointmentResponse> getAppointmentsForCustomer(Integer customerId);

    List<AppointmentResponse> getAppointmentsForAdvisor(Integer advisorId);

    // Lấy danh sách lịch hẹn trạng thái PENDING cho advisor xác nhận
    List<AppointmentResponse> getPendingAppointmentsForAdvisor(Integer advisorId);

    // Phân công technician cho appointment (sẽ tạo ServiceOrder)
    AppointmentResponse assignTechnician(Long appointmentId, AssignTechnicianRequest request, User loggedInAdvisor);
}
