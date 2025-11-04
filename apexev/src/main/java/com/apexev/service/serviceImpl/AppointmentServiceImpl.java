package com.apexev.service.serviceImpl;

import com.apexev.dto.request.coreBussinessRequest.AppointmentRequest;
import com.apexev.dto.request.coreBussinessRequest.RescheduleAppointmentRequest;
import com.apexev.dto.response.coreBussinessResponse.AppointmentResponse;
import com.apexev.entity.Appointment;
import com.apexev.entity.User;
import com.apexev.entity.Vehicle;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.AppointmentRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.repository.userAndVehicle.VehicleRepository;
import com.apexev.service.service_Interface.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository; // gắn cố vấn dịch vụ
    //setup tự động chuyển Entity -> DTO
    private final ModelMapper modelMapper;

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request, User loggedInUser) {
        // 1. tìm xe - nếu họ chưa điền info xe của họ (tức là lần đầu dùng app) thì họ phải vào profile và điền thông tin tương thích với bảng vehice
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy xe với ID: " + request.getVehicleId()));
        // 2. lấy chủ xe - phục vụ cho logic bảo mật
        User customer = vehicle.getCustomer();
        // 3. logic bảo mật
        if (loggedInUser.getRole() == UserRole.CUSTOMER && !customer.getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không phải user này, không có quyền đặt lịch cho xe này.");
        }
        // 4. check future - nếu đặt trong quá khứ -> no
        if(request.getAppointmentTime().isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("Không thể đặt lịch trong quá khứ");
        }
        // 5. tạo lịch hẹn
        Appointment newAppointment = new Appointment();
        newAppointment.setCustomer(customer);
        newAppointment.setVehicle(vehicle);
        newAppointment.setAppointmentTime(request.getAppointmentTime());
        newAppointment.setRequestedService(request.getRequestedService());
        newAppointment.setNotes(request.getNotes());
        // 6. set trạng thái ban đầu là pending
        newAppointment.setStatus(AppointmentStatus.PENDING);
        // 7. lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(newAppointment);
        return modelMapper.map(savedAppointment, AppointmentResponse.class);
        // giải thích
        /*
        thay vì chuyển đổi thủ công bằng convertDTO thông thường
        -> hãy để mapper làm nó -> model Mapper là thư viện hỗ trợ việc convert
        => thêm dependence vào
        <dependency>
            <groupId>org.modelmapper</groupId>
            <artifactId>modelmapper</artifactId>
            <version>3.1.0</version>
        </dependency>
         */
    }

    @Override
    public AppointmentResponse rescheduleAppointment(Long appointmentId, RescheduleAppointmentRequest request, User loggedInUser) {
        // 1. tìm lịch hẹn
        Appointment appointment = findAppointmentByIdInternal(appointmentId);
        // 2. logic bảo mật
        checkOwnership(appointment, loggedInUser);
        // 3. logic ko thể dời lịch đã hoàn thành hoặc đã hủy
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Không thể dời lịch hẹn đã " + appointment.getStatus());
        }
        // 4. Cập nhật thời gian mới
        appointment.setAppointmentTime(request.getNewAppointmentTime());
        // 5. Khi dời lịch -> trạng thái quay lại pending -> chờ cố vấn duyệt
        appointment.setStatus(AppointmentStatus.PENDING);
        // 6. Lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return modelMapper.map(savedAppointment, AppointmentResponse.class);
    }

    @Override
    public AppointmentResponse cancelAppointment(Long appointmentId, User loggedInUser) {
        // 1. tìm lịch hẹn
        Appointment appointment = findAppointmentByIdInternal(appointmentId);
        // 2. logic bảo mật
        checkOwnership(appointment, loggedInUser);
        // 3. không thể hủy lịch đã hoàn thành và đã hủy
        if(appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Không thể hủy lịch hẹn đã hủy hoặc đã hoàn thành");
        }
        // 4. set trạng thái đã hủy
        appointment.setStatus(AppointmentStatus.CANCELLED);
        // 5. lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return modelMapper.map(savedAppointment, AppointmentResponse.class);
    }

    @Override
    public AppointmentResponse confirmAppointment(Long appointmentId, User loggedInUser) {
        // 1. khách hàng ko được tự xác nhận lịch hẹn
        if(loggedInUser.getRole() == UserRole.CUSTOMER) {
            throw new AccessDeniedException("Customer không thể tự xác nhận lịch hẹn.");
        }
        // 2. tìm lịch hẹn
        Appointment appointment = findAppointmentByIdInternal(appointmentId);
        // 3. chỉ xác nhận các lịch hẹn PENDING
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể xác nhận lịch hẹn đang ở trạng thái PENDING.");
        }
        // 4. cập nhật trạng thái và gán cố vân -> lưu ý cố vấn là người comfirm
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setServiceAdvisor(loggedInUser);
        // 5. lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return modelMapper.map(savedAppointment, AppointmentResponse.class);
    }

    @Override
    public AppointmentResponse getAppointmentById(Long appointmentId, User loggedInUser) {
        // 1. tìm lịch hẹn
        Appointment appointment = findAppointmentByIdInternal(appointmentId);
        // 2. ktra quyền
        checkOwnership(appointment, loggedInUser);
        // 3. trả về
        return modelMapper.map(appointment, AppointmentResponse.class);
    }

    @Override
    public List<AppointmentResponse> getAppointmentsForCustomer(Integer customerId) {
        // 1. ktra customer có tồn tại ko
        userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
        // 2. lấy ds và sắp xếp lịch gần nhất lên đầu
        List<Appointment> appointments = appointmentRepository.findByCustomerUserIdOrderByAppointmentTimeDesc(customerId);
        // 3. Dùng Stream để map cả danh sách sang List<AppointmentResponse>
        return appointments.stream() // stream kiểu như dây chuyền để đóng gói hàng loạt các appointment bên dưới thành 1 list
                .map(appointment -> modelMapper.map(appointment, AppointmentResponse.class))
                .collect(Collectors.toList()); // đóng gói các appointment lại thành 1 list
    }

    @Override
    public List<AppointmentResponse> getAppointmentsForAdvisor(Integer advisorId) {
        // 1. Kiểm tra xem Advisor ID có tồn tại không
        User advisor = userRepository.findById(advisorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Cố vấn với ID: " + advisorId));
        // 2. Kiểm tra xem với id này user có đúng là Cố vấn không
        if(advisor.getRole() != UserRole.SERVICE_ADVISOR) {
            throw new IllegalArgumentException("User (ID: " + advisorId + ") không phải là Cố vấn dịch vụ.");
        }
        // 3. lấy ds và sắp xếp lịch gần nhất lên đầu
        List<Appointment> appointments = appointmentRepository.findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(advisorId);
        // 4. Map cả danh sách sang List<AppointmentResponse>
        return appointments.stream()
                .map(appointment -> modelMapper.map(appointment, AppointmentResponse.class))
                .collect(Collectors.toList());
    }
    // hàm tìm kiếm
    private Appointment findAppointmentByIdInternal(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
    }
    //Hàm kiểm tra quyền sở hữu (Customer chỉ được sửa/xóa/xem lịch của mình) -> ko làm với user khác
    private void checkOwnership(Appointment appointment, User loggedInUser) {
        if (loggedInUser.getRole() == UserRole.CUSTOMER && !appointment.getCustomer().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập lịch hẹn này.");
        }
        // nghĩa là nếu là ADMIN/MANAGER/SERVICE_ADVISOR thì có toàn quyền -> chỉ quy định cho CUSTOMER
    }
}
