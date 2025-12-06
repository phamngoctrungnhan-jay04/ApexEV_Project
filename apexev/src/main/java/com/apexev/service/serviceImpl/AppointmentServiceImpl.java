package com.apexev.service.serviceImpl;

import com.apexev.dto.request.coreBussinessRequest.AppointmentRequest;
import com.apexev.dto.request.coreBussinessRequest.AssignTechnicianRequest;
import com.apexev.dto.request.coreBussinessRequest.RescheduleAppointmentRequest;
import com.apexev.dto.response.coreBussinessResponse.AppointmentResponse;
import com.apexev.entity.Appointment;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.entity.Vehicle;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.OrderStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.AppointmentRepository;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.repository.userAndVehicle.VehicleRepository;
import com.apexev.service.service_Interface.AppointmentService;
import com.apexev.service.service_Interface.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository; // gắn cố vấn dịch vụ
    private final NotificationService notificationService; // Thêm NotificationService
    private final com.apexev.repository.coreBussiness.ServiceRepository serviceRepository; // Inject ServiceRepository
    private final ServiceOrderRepository serviceOrderRepository; // Inject để tạo ServiceOrder
    // setup tự động chuyển Entity -> DTO
    private final ModelMapper modelMapper;
    private final MailService mailService; // Inject MailService

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request, User loggedInUser) {
        // Log dữ liệu đầu vào
        System.out.println("[REQUEST] vehicleId=" + request.getVehicleId() + ", appointmentTime="
                + request.getAppointmentTime() + ", serviceIds=" + request.getServiceIds());
        // 1. tìm xe - nếu họ chưa điền info xe của họ (tức là lần đầu dùng app) thì họ
        // phải vào profile và điền thông tin tương thích với bảng vehice
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy xe với ID: " + request.getVehicleId()));
        // 2. lấy chủ xe - phục vụ cho logic bảo mật
        User customer = vehicle.getCustomer();
        // 3. logic bảo mật
        if (loggedInUser.getRole() == UserRole.CUSTOMER && !customer.getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không phải user này, không có quyền đặt lịch cho xe này.");
        }
        // 4. check future - nếu đặt trong quá khứ -> no
        if (request.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Không thể đặt lịch trong quá khứ");
        }
        // 5. tạo lịch hẹn
        Appointment newAppointment = new Appointment();
        newAppointment.setCustomer(customer);
        newAppointment.setVehicle(vehicle);
        newAppointment.setAppointmentTime(request.getAppointmentTime());
        // Map requestedService từ serviceIds nếu có
        String requestedServiceStr = null;
        String serviceIdsStr = null;
        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            java.util.List<String> serviceNames = new java.util.ArrayList<>();
            java.util.List<String> serviceIdList = new java.util.ArrayList<>();
            for (Integer sidInt : request.getServiceIds()) {
                Long sid = sidInt.longValue();
                serviceIdList.add(sid.toString());
                var serviceOpt = serviceRepository.findById(sid);
                serviceOpt.ifPresent(s -> serviceNames.add(s.getName()));
            }
            requestedServiceStr = String.join(", ", serviceNames);
            serviceIdsStr = String.join(",", serviceIdList);
        }
        newAppointment.setRequestedService(requestedServiceStr != null ? requestedServiceStr
                : (request.getRequestedService() != null ? request.getRequestedService().trim() : null));
        newAppointment.setServiceIds(serviceIdsStr); // Lưu danh sách serviceIds
        newAppointment.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        // 6. set trạng thái ban đầu là pending
        newAppointment.setStatus(AppointmentStatus.PENDING);
        // Debug log khi tạo lịch
        System.out.println("[CREATE] appointmentTime=" + request.getAppointmentTime() + ", requestedService="
                + request.getRequestedService());
        // 7. lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(newAppointment);
        // Debug log để kiểm tra dữ liệu mapping
        System.out.println("[DEBUG] Appointment created: appointmentTime=" + newAppointment.getAppointmentTime()
                + ", requestedService=" + newAppointment.getRequestedService() + ", notes="
                + newAppointment.getNotes());

        // 8. Gửi notification cho customer
        String message = String.format(
                "Lịch hẹn của bạn đã được tạo thành công vào lúc %s. Vui lòng chờ cố vấn xác nhận.",
                savedAppointment.getAppointmentTime().toString());
        notificationService.sendNotification(customer, message, null);

        return modelMapper.map(savedAppointment, AppointmentResponse.class);
        // giải thích
        /*
         * thay vì chuyển đổi thủ công bằng convertDTO thông thường
         * -> hãy để mapper làm nó -> model Mapper là thư viện hỗ trợ việc convert
         * => thêm dependence vào
         * <dependency>
         * <groupId>org.modelmapper</groupId>
         * <artifactId>modelmapper</artifactId>
         * <version>3.1.0</version>
         * </dependency>
         */
    }

    @Override
    public AppointmentResponse rescheduleAppointment(Long appointmentId, RescheduleAppointmentRequest request,
            User loggedInUser) {
        // 1. tìm lịch hẹn
        Appointment appointment = findAppointmentByIdInternal(appointmentId);
        // 2. logic bảo mật
        checkOwnership(appointment, loggedInUser);
        // 3. logic ko thể dời lịch đã hoàn thành hoặc đã hủy
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
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
        System.out
                .println("[DEBUG] Bắt đầu hủy lịch hẹn: id=" + appointmentId + ", user=" + loggedInUser.getFullName());
        // 2. logic bảo mật
        checkOwnership(appointment, loggedInUser);
        // 3. không thể hủy lịch đã hoàn thành và đã hủy
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            System.out.println("[DEBUG] Lịch đã hoàn thành hoặc đã hủy, không thể hủy lại.");
            throw new IllegalStateException("Không thể hủy lịch hẹn đã hủy hoặc đã hoàn thành");
        }
        // 4. set trạng thái đã hủy
        appointment.setStatus(AppointmentStatus.CANCELLED);
        // 5. lưu và trả về
        Appointment savedAppointment = appointmentRepository.save(appointment);
        System.out.println("[DEBUG] Đã cập nhật trạng thái CANCELLED cho lịch id=" + appointmentId);

        // 6. Gửi notification cho customer về việc bị từ chối/hủy
        String message = String.format("Lịch hẹn của bạn vào lúc %s đã bị từ chối/hủy bởi cố vấn %s.",
                savedAppointment.getAppointmentTime().toString(),
                loggedInUser.getFullName());
        try {
            notificationService.sendNotification(appointment.getCustomer(), message, null);
            System.out.println(
                    "[DEBUG] Đã gửi notification từ chối/hủy cho user: " + appointment.getCustomer().getUserId());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi gửi notification: " + e.getMessage());
        }

        // 7. Gửi email cho customer khi lịch hẹn bị từ chối/hủy
        String emailSubject = "[ApexEV] Lịch hẹn bị từ chối/hủy";
        String emailBody = String.format(
                "<p>Xin chào %s,</p>"
                        + "<p>Rất tiếc, lịch hẹn của bạn vào lúc <b>%s</b> đã bị từ chối/hủy bởi cố vấn <b>%s</b>.</p>"
                        + "<p>Nếu cần hỗ trợ hoặc đặt lại lịch, vui lòng liên hệ lại với chúng tôi.</p>"
                        + "<br><p>Trân trọng,<br>ApexEV Team</p>",
                appointment.getCustomer().getFullName(),
                savedAppointment.getAppointmentTime().toString(),
                loggedInUser.getFullName());
        try {
            mailService.sendEmail(appointment.getCustomer().getEmail(), emailSubject, emailBody, null); // Không đính
                                                                                                        // kèm file
            System.out.println("[DEBUG] Đã gửi email từ chối/hủy cho: " + appointment.getCustomer().getEmail());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi gửi email: " + e.getMessage());
        }

        return modelMapper.map(savedAppointment, AppointmentResponse.class);
    }

    @Override
    public AppointmentResponse confirmAppointment(Long appointmentId, User loggedInUser) {
        // 1. khách hàng ko được tự xác nhận lịch hẹn
        if (loggedInUser.getRole() == UserRole.CUSTOMER) {
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

        // 6. Gửi notification cho customer
        String message = String.format("Lịch hẹn của bạn vào lúc %s đã được xác nhận bởi cố vấn %s.",
                savedAppointment.getAppointmentTime().toString(),
                loggedInUser.getFullName());
        notificationService.sendNotification(appointment.getCustomer(), message, null);

        // 7. Gửi email cho customer khi advisor xác nhận lịch hẹn
        String emailSubject = "[ApexEV] Lịch hẹn đã được xác nhận";
        String emailBody = String.format(
                "<p>Xin chào %s,</p>"
                        + "<p>Lịch hẹn của bạn vào lúc <b>%s</b> đã được xác nhận bởi cố vấn <b>%s</b>.</p>"
                        + "<p>Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>"
                        + "<br><p>Trân trọng,<br>ApexEV Team</p>",
                appointment.getCustomer().getFullName(),
                savedAppointment.getAppointmentTime().toString(),
                loggedInUser.getFullName());
        mailService.sendEmail(appointment.getCustomer().getEmail(), emailSubject, emailBody, null); // Không đính kèm
                                                                                                    // file

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
        List<Appointment> appointments = appointmentRepository
                .findByCustomerUserIdOrderByAppointmentTimeDesc(customerId);
        // 3. Map sang DTO với đầy đủ thông tin technician từ ServiceOrder
        return appointments.stream()
                .map(appointment -> {
                    AppointmentResponse dto = modelMapper.map(appointment, AppointmentResponse.class);
                    // Thêm phone của customer
                    if (appointment.getCustomer() != null) {
                        dto.setCustomerPhone(appointment.getCustomer().getPhone());
                    }
                    // Kiểm tra xem appointment này đã có ServiceOrder chưa -> lấy technician từ đó
                    ServiceOrder existingOrder = serviceOrderRepository.findByAppointmentId(appointment.getId())
                            .orElse(null);
                    if (existingOrder != null) {
                        dto.setServiceOrderId(existingOrder.getId()); // Set serviceOrderId
                        dto.setServiceOrderStatus(existingOrder.getStatus().name()); // Set serviceOrderStatus
                        if (existingOrder.getTechnician() != null) {
                            dto.setAssignedTechnicianId(existingOrder.getTechnician().getUserId().longValue());
                            dto.setAssignedTechnicianName(existingOrder.getTechnician().getFullName());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsForAdvisor(Integer advisorId) {
        // 1. Kiểm tra xem Advisor ID có tồn tại không
        User advisor = userRepository.findById(advisorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Cố vấn với ID: " + advisorId));
        if (advisor.getRole() != UserRole.SERVICE_ADVISOR) {
            throw new IllegalArgumentException("User (ID: " + advisorId + ") không phải là Cố vấn dịch vụ.");
        }
        // 2. lấy ds và sắp xếp lịch gần nhất lên đầu
        List<Appointment> appointments = appointmentRepository
                .findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(advisorId);
        // 3. Map cả danh sách sang List<AppointmentResponse> với đầy đủ thông tin
        return appointments.stream()
                .map(appointment -> {
                    AppointmentResponse dto = modelMapper.map(appointment, AppointmentResponse.class);
                    // Thêm phone của customer
                    if (appointment.getCustomer() != null) {
                        dto.setCustomerPhone(appointment.getCustomer().getPhone());
                    }
                    // Kiểm tra xem appointment này đã có ServiceOrder chưa -> lấy technician từ đó
                    ServiceOrder existingOrder = serviceOrderRepository.findByAppointmentId(appointment.getId())
                            .orElse(null);
                    if (existingOrder != null) {
                        dto.setServiceOrderId(existingOrder.getId()); // Set serviceOrderId
                        dto.setServiceOrderStatus(existingOrder.getStatus().name()); // Set serviceOrderStatus
                        if (existingOrder.getTechnician() != null) {
                            dto.setAssignedTechnicianId(existingOrder.getTechnician().getUserId().longValue());
                            dto.setAssignedTechnicianName(existingOrder.getTechnician().getFullName());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Lấy danh sách lịch hẹn trạng thái PENDING cho advisor xác nhận
    @Override
    public List<AppointmentResponse> getPendingAppointmentsForAdvisor(Integer advisorId) {
        // 1. Kiểm tra xem Advisor ID có tồn tại không
        User advisor = userRepository.findById(advisorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Cố vấn với ID: " + advisorId));
        if (advisor.getRole() != UserRole.SERVICE_ADVISOR) {
            throw new IllegalArgumentException("User (ID: " + advisorId + ") không phải là Cố vấn dịch vụ.");
        }
        // 2. Lấy tất cả lịch hẹn có trạng thái PENDING (chưa được xác nhận) - có thể
        // chưa gán advisor
        List<Appointment> appointments = appointmentRepository
                .findByStatusOrderByAppointmentTimeAsc(AppointmentStatus.PENDING);
        // Debug log để kiểm tra dữ liệu trả về cho advisor
        System.out.println("[DEBUG] /pending API - Số lượng lịch hẹn PENDING: " + appointments.size());
        for (Appointment a : appointments) {
            System.out.println("[DEBUG] Appointment id=" + a.getId() + ", requestedService=" + a.getRequestedService()
                    + ", notes=" + a.getNotes() + ", advisor="
                    + (a.getServiceAdvisor() != null ? a.getServiceAdvisor().getUserId() : "null"));
        }
        List<AppointmentResponse> responseList = appointments.stream()
                .map(appointment -> {
                    AppointmentResponse dto = modelMapper.map(appointment, AppointmentResponse.class);
                    // Thêm phone của customer
                    if (appointment.getCustomer() != null) {
                        dto.setCustomerPhone(appointment.getCustomer().getPhone());
                    }
                    // Kiểm tra xem appointment này đã có ServiceOrder chưa -> lấy technician từ đó
                    ServiceOrder existingOrder = serviceOrderRepository.findByAppointmentId(appointment.getId())
                            .orElse(null);
                    if (existingOrder != null) {
                        dto.setServiceOrderId(existingOrder.getId()); // Set serviceOrderId
                        dto.setServiceOrderStatus(existingOrder.getStatus().name()); // Set serviceOrderStatus
                        if (existingOrder.getTechnician() != null) {
                            dto.setAssignedTechnicianId(existingOrder.getTechnician().getUserId().longValue());
                            dto.setAssignedTechnicianName(existingOrder.getTechnician().getFullName());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        // Log dữ liệu DTO trả về cho FE
        for (AppointmentResponse r : responseList) {
            System.out.println("[DTO] id=" + r.getId() + ", requestedService=" + r.getRequestedService() + ", notes="
                    + r.getNotes());
        }
        return responseList;
    }

    // hàm tìm kiếm - dùng JOIN FETCH để load customer và vehicle
    private Appointment findAppointmentByIdInternal(Long appointmentId) {
        return appointmentRepository.findByIdWithCustomerAndVehicle(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
    }

    // Hàm kiểm tra quyền sở hữu (Customer chỉ được sửa/xóa/xem lịch của mình) -> ko
    // làm với user khác
    private void checkOwnership(Appointment appointment, User loggedInUser) {
        if (loggedInUser.getRole() == UserRole.CUSTOMER
                && !appointment.getCustomer().getUserId().equals(loggedInUser.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập lịch hẹn này.");
        }
        // nghĩa là nếu là ADMIN/MANAGER/SERVICE_ADVISOR thì có toàn quyền -> chỉ quy
        // định cho CUSTOMER
    }

    @Override
    @Transactional
    public AppointmentResponse assignTechnician(Long appointmentId, AssignTechnicianRequest request,
            User loggedInAdvisor) {
        // 1. Kiểm tra quyền - chỉ Service Advisor mới được phân công
        if (loggedInAdvisor.getRole() != UserRole.SERVICE_ADVISOR) {
            throw new AccessDeniedException("Chỉ Cố vấn dịch vụ mới có quyền phân công kỹ thuật viên.");
        }

        // 2. Tìm appointment
        Appointment appointment = findAppointmentByIdInternal(appointmentId);

        // DEBUG: Log customer và vehicle
        System.out.println("[ASSIGN-DEBUG] Appointment ID: " + appointment.getId());
        System.out.println("[ASSIGN-DEBUG] Customer: " + appointment.getCustomer());
        System.out.println("[ASSIGN-DEBUG] Vehicle: " + appointment.getVehicle());

        // Đảm bảo customer và vehicle được load (tránh LazyInitializationException)
        User customer = appointment.getCustomer();
        Vehicle vehicle = appointment.getVehicle();

        if (customer == null) {
            throw new IllegalStateException("Lịch hẹn không có thông tin khách hàng.");
        }
        if (vehicle == null) {
            throw new IllegalStateException("Lịch hẹn không có thông tin xe.");
        }

        System.out.println("[ASSIGN-DEBUG] Customer ID: " + customer.getUserId() + ", Name: " + customer.getFullName());
        System.out.println("[ASSIGN-DEBUG] Vehicle ID: " + vehicle.getId());

        // 3. Kiểm tra trạng thái - chỉ phân công khi PENDING
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể phân công kỹ thuật viên cho lịch hẹn đang chờ xác nhận.");
        }

        // 4. Tìm technician
        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy kỹ thuật viên với ID: " + request.getTechnicianId()));

        // 5. Kiểm tra role của technician
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new IllegalArgumentException("User được chọn không phải là Kỹ thuật viên.");
        }

        // 6. Cập nhật Appointment
        appointment.setServiceAdvisor(loggedInAdvisor);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 7. Tạo ServiceOrder để Technician có công việc để làm
        ServiceOrder serviceOrder = new ServiceOrder();
        serviceOrder.setAppointment(savedAppointment);
        serviceOrder.setCustomer(customer); // Dùng biến đã load
        serviceOrder.setVehicle(vehicle); // Dùng biến đã load
        serviceOrder.setServiceAdvisor(loggedInAdvisor);
        serviceOrder.setTechnician(technician);
        serviceOrder.setStatus(OrderStatus.CONFIRMED); // Trạng thái ban đầu: Đã xác nhận, chờ kỹ thuật viên tiếp nhận
        serviceOrder.setCustomerDescription(appointment.getRequestedService()); // Lấy mô tả từ appointment

        // Gộp notes từ appointment với advisorNotes từ request (nếu có)
        String combinedNotes = "";
        if (appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty()) {
            combinedNotes = "Ghi chú khách hàng: " + appointment.getNotes().trim();
        }
        if (request.getAdvisorNotes() != null && !request.getAdvisorNotes().trim().isEmpty()) {
            if (!combinedNotes.isEmpty()) {
                combinedNotes += "\n";
            }
            combinedNotes += "Ghi chú cố vấn: " + request.getAdvisorNotes().trim();
        }
        serviceOrder.setAdvisorNotes(combinedNotes.isEmpty() ? null : combinedNotes);

        // 7.1. Tạo ServiceOrderItem từ serviceIds của appointment
        java.util.Set<com.apexev.entity.ServiceOrderItem> orderItems = new java.util.HashSet<>();
        if (appointment.getServiceIds() != null && !appointment.getServiceIds().trim().isEmpty()) {
            String[] ids = appointment.getServiceIds().split(",");
            for (String idStr : ids) {
                try {
                    Long serviceId = Long.parseLong(idStr.trim());
                    var serviceOpt = serviceRepository.findById(serviceId);
                    if (serviceOpt.isPresent()) {
                        var service = serviceOpt.get();
                        com.apexev.entity.ServiceOrderItem item = new com.apexev.entity.ServiceOrderItem();
                        item.setItemType(com.apexev.enums.OrderItemType.SERVICE);
                        item.setItemRefId(serviceId);
                        item.setQuantity(1);
                        item.setUnitPrice(
                                service.getUnitPrice() != null ? service.getUnitPrice() : java.math.BigDecimal.ZERO);
                        item.setStatus(com.apexev.enums.OrderItemStatus.APPROVED); // Đã được khách duyệt khi đặt lịch
                        item.setServiceOrder(serviceOrder);
                        orderItems.add(item);
                        System.out.println("[ASSIGN] Thêm service item: " + service.getName() + ", ID=" + serviceId);
                    }
                } catch (NumberFormatException e) {
                    System.out.println("[ASSIGN] Lỗi parse serviceId: " + idStr);
                }
            }
        }
        serviceOrder.setOrderItems(orderItems);

        ServiceOrder savedServiceOrder = serviceOrderRepository.save(serviceOrder);

        // 8. Gửi notification cho Technician
        String technicianMessage = String.format(
                "Bạn được phân công công việc mới cho xe %s - %s. Khách hàng: %s",
                appointment.getVehicle().getBrand(),
                appointment.getVehicle().getModel(),
                appointment.getCustomer().getFullName());
        try {
            notificationService.sendNotification(technician, technicianMessage, null);
            System.out.println("[ASSIGN] Đã gửi notification cho technician: " + technician.getUserId());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi gửi notification cho technician: " + e.getMessage());
        }

        // 9. Gửi notification cho Customer
        String customerMessage = String.format(
                "Lịch hẹn của bạn đã được xác nhận. Kỹ thuật viên %s sẽ phụ trách xe của bạn.",
                technician.getFullName());
        try {
            notificationService.sendNotification(appointment.getCustomer(), customerMessage, null);
            System.out.println("[ASSIGN] Đã gửi notification cho customer: " + appointment.getCustomer().getUserId());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi gửi notification cho customer: " + e.getMessage());
        }

        // 10. Log
        System.out.println("[ASSIGN] ServiceOrder #" + savedServiceOrder.getId() + " created for Technician "
                + technician.getFullName());

        // 11. Map response với đầy đủ thông tin technician đã assign
        AppointmentResponse response = modelMapper.map(savedAppointment, AppointmentResponse.class);
        response.setAssignedTechnicianId(technician.getUserId().longValue());
        response.setAssignedTechnicianName(technician.getFullName());

        return response;
    }
}
