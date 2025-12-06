package com.apexev.service.serviceImpl;

import com.apexev.dto.request.technicianRequest.AddTechnicianNotesRequest;
import com.apexev.dto.request.technicianRequest.UpdateWorkStatusRequest;
import com.apexev.dto.response.technicianResponse.TechnicianAvailabilityResponse;
import com.apexev.dto.response.technicianResponse.TechnicianWorkDetailResponse;
import com.apexev.dto.response.technicianResponse.TechnicianWorkResponse;
import com.apexev.dto.response.technicianResponse.WorkOrderItemResponse;
import com.apexev.entity.MaintenanceService;
import com.apexev.entity.Part;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.enums.OrderItemType;
import com.apexev.enums.OrderStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.MaintenanceServiceRepository;
import com.apexev.repository.coreBussiness.PartRepository;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.service.service_Interface.TechnicianWorkService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianWorkServiceImpl implements TechnicianWorkService {
    private final ServiceOrderRepository serviceOrderRepository;
    private final PartRepository partRepository;
    private final MaintenanceServiceRepository maintenanceServiceRepository;
    private final UserRepository userRepository;

    @Override
    public List<TechnicianWorkResponse> getMyAssignedWorks(User technician) {
        // Kiểm tra role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể xem danh sách công việc.");
        }

        // Lấy danh sách công việc (loại trừ COMPLETED và CANCELLED)
        List<ServiceOrder> works = serviceOrderRepository
                .findByTechnicianUserIdAndStatusNot(technician.getUserId(), OrderStatus.COMPLETED);

        // Lọc thêm để loại bỏ CANCELLED
        return works.stream()
                .filter(work -> work.getStatus() != OrderStatus.CANCELLED)
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    public TechnicianWorkDetailResponse getWorkDetail(Long workId, User technician) {
        ServiceOrder work = findWorkAndCheckOwnership(workId, technician);
        return convertToDetailDto(work);
    }

    @Override
    @Transactional
    public TechnicianWorkDetailResponse updateWorkStatus(Long workId, UpdateWorkStatusRequest request,
            User technician) {
        ServiceOrder work = findWorkAndCheckOwnership(workId, technician);

        OrderStatus currentStatus = work.getStatus();
        OrderStatus newStatus = request.getNewStatus();

        // Validate chuyển trạng thái hợp lệ
        validateStatusTransition(currentStatus, newStatus);

        // Cập nhật trạng thái
        work.setStatus(newStatus);

        // Nếu chuyển sang READY_FOR_INVOICE thì set completedAt
        if (newStatus == OrderStatus.READY_FOR_INVOICE) {
            work.setCompletedAt(LocalDateTime.now());
        }

        ServiceOrder savedWork = serviceOrderRepository.save(work);
        return convertToDetailDto(savedWork);
    }

    @Override
    @Transactional
    public TechnicianWorkDetailResponse addTechnicianNotes(Long workId, AddTechnicianNotesRequest request,
            User technician) {
        ServiceOrder work = findWorkAndCheckOwnership(workId, technician);

        // Cập nhật ghi chú
        work.setTechnicianNotes(request.getNotes());

        ServiceOrder savedWork = serviceOrderRepository.save(work);
        return convertToDetailDto(savedWork);
    }

    // === HELPER METHODS ===

    private ServiceOrder findWorkAndCheckOwnership(Long workId, User technician) {
        // Kiểm tra role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể truy cập.");
        }

        // Tìm công việc
        ServiceOrder work = serviceOrderRepository.findById(workId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công việc với ID: " + workId));

        // Kiểm tra quyền sở hữu
        if (work.getTechnician() == null || !work.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập công việc này.");
        }

        return work;
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Technician chỉ được chuyển một số trạng thái nhất định
        boolean isValidTransition = false;

        switch (currentStatus) {
            case CONFIRMED:
                // Từ CONFIRMED chỉ có thể chuyển sang RECEPTION (kỹ thuật viên tiếp nhận xe)
                isValidTransition = (newStatus == OrderStatus.RECEPTION);
                break;
            case RECEPTION:
                // Từ RECEPTION có thể chuyển sang INSPECTION (bắt đầu kiểm tra xe)
                isValidTransition = (newStatus == OrderStatus.INSPECTION);
                break;
            case INSPECTION:
                // Từ INSPECTION có thể chuyển sang QUOTING hoặc IN_PROGRESS
                isValidTransition = (newStatus == OrderStatus.QUOTING || newStatus == OrderStatus.IN_PROGRESS);
                break;
            case QUOTING:
                // Từ QUOTING có thể chuyển sang IN_PROGRESS hoặc WAITING_FOR_PARTS
                isValidTransition = (newStatus == OrderStatus.IN_PROGRESS
                        || newStatus == OrderStatus.WAITING_FOR_PARTS);
                break;
            case WAITING_FOR_PARTS:
                // Từ WAITING_FOR_PARTS chuyển sang IN_PROGRESS
                isValidTransition = (newStatus == OrderStatus.IN_PROGRESS);
                break;
            case IN_PROGRESS:
                // Từ IN_PROGRESS chuyển sang READY_FOR_INVOICE hoặc WAITING_FOR_PARTS
                isValidTransition = (newStatus == OrderStatus.READY_FOR_INVOICE
                        || newStatus == OrderStatus.WAITING_FOR_PARTS);
                break;
            default:
                isValidTransition = false;
        }

        if (!isValidTransition) {
            throw new IllegalStateException(
                    String.format("Không thể chuyển từ trạng thái %s sang %s", currentStatus, newStatus));
        }
    }

    private TechnicianWorkResponse convertToSummaryDto(ServiceOrder work) {
        TechnicianWorkResponse dto = new TechnicianWorkResponse();
        dto.setId(work.getId());
        dto.setStatus(work.getStatus());
        dto.setCreatedAt(work.getCreatedAt());

        // Lấy appointmentTime từ appointment nếu có
        if (work.getAppointment() != null) {
            dto.setAppointmentTime(work.getAppointment().getAppointmentTime());
        }

        // Thông tin xe
        dto.setVehicleLicensePlate(work.getVehicle().getLicensePlate());
        dto.setVehicleModel(work.getVehicle().getModel());
        dto.setVehicleBrand(work.getVehicle().getBrand());

        // Thông tin khách hàng
        dto.setCustomerName(work.getCustomer().getFullName());
        dto.setCustomerPhone(work.getCustomer().getPhone());

        // Mô tả
        dto.setCustomerDescription(work.getCustomerDescription());

        return dto;
    }

    private TechnicianWorkDetailResponse convertToDetailDto(ServiceOrder work) {
        TechnicianWorkDetailResponse dto = new TechnicianWorkDetailResponse();
        dto.setId(work.getId());
        dto.setStatus(work.getStatus());
        dto.setCreatedAt(work.getCreatedAt());

        // Thông tin xe
        dto.setVehicleLicensePlate(work.getVehicle().getLicensePlate());
        dto.setVehicleModel(work.getVehicle().getModel());
        dto.setVehicleBrand(work.getVehicle().getBrand());
        dto.setVehicleVinNumber(work.getVehicle().getVinNumber());
        dto.setVehicleYearManufactured(work.getVehicle().getYearManufactured());

        // Thông tin khách hàng
        dto.setCustomerName(work.getCustomer().getFullName());
        dto.setCustomerPhone(work.getCustomer().getPhone());

        // Mô tả và ghi chú
        dto.setCustomerDescription(work.getCustomerDescription());
        dto.setAdvisorNotes(work.getAdvisorNotes());
        dto.setTechnicianNotes(work.getTechnicianNotes());

        // Thông tin cố vấn
        dto.setServiceAdvisorName(work.getServiceAdvisor().getFullName());

        // Danh sách items
        List<WorkOrderItemResponse> itemDtos = work.getOrderItems().stream()
                .map(item -> {
                    WorkOrderItemResponse itemDto = new WorkOrderItemResponse();
                    itemDto.setId(item.getId());
                    itemDto.setItemType(item.getItemType());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setStatus(item.getStatus());

                    // Lấy tên item và ID theo loại
                    if (item.getItemType() == OrderItemType.SERVICE) {
                        maintenanceServiceRepository.findById(item.getItemRefId())
                                .ifPresent(service -> {
                                    itemDto.setServiceId(service.getId());
                                    itemDto.setServiceName(service.getName());
                                    itemDto.setItemName(service.getName()); // backward compatible
                                });
                        if (itemDto.getServiceName() == null) {
                            itemDto.setItemName("Dịch vụ không xác định");
                        }
                    } else if (item.getItemType() == OrderItemType.PART) {
                        partRepository.findById(item.getItemRefId())
                                .ifPresent(part -> {
                                    itemDto.setPartId(part.getId());
                                    itemDto.setPartName(part.getPartName());
                                    itemDto.setItemName(part.getPartName()); // backward compatible
                                });
                        if (itemDto.getPartName() == null) {
                            itemDto.setItemName("Phụ tùng không xác định");
                        }
                    }

                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setOrderItems(itemDtos);

        return dto;
    }

    @Override
    public List<TechnicianAvailabilityResponse> getAvailableTechnicians() {
        try {
            System.out.println("[DEBUG] getAvailableTechnicians() - Bắt đầu tìm technicians...");

            // Lấy tất cả technicians
            List<User> allUsers = userRepository.findAll();
            System.out.println("[DEBUG] Tổng số users trong DB: " + allUsers.size());

            List<User> technicians = allUsers.stream()
                    .filter(user -> {
                        boolean isTech = user.getRole() == UserRole.TECHNICIAN;
                        boolean isActive = user.isActive();
                        System.out.println("[DEBUG] User " + user.getUserId() + " - " + user.getFullName()
                                + " - Role: " + user.getRole() + " - Active: " + isActive);
                        return isTech && isActive;
                    })
                    .collect(Collectors.toList());

            System.out.println("[DEBUG] Số technicians tìm được: " + technicians.size());

            // Đếm số công việc đang làm của mỗi technician
            return technicians.stream()
                    .map(tech -> {
                        long activeWorkCount = 0;
                        try {
                            List<ServiceOrder> orders = serviceOrderRepository
                                    .findByTechnicianUserIdAndStatusNot(tech.getUserId(), OrderStatus.COMPLETED);
                            activeWorkCount = orders.stream()
                                    .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                                    .count();
                            System.out.println("[DEBUG] Tech " + tech.getFullName() + " có " + activeWorkCount
                                    + " công việc đang làm");
                        } catch (Exception e) {
                            System.err.println("[ERROR] Lỗi khi đếm công việc cho tech " + tech.getUserId() + ": "
                                    + e.getMessage());
                        }

                        return TechnicianAvailabilityResponse.builder()
                                .userId(tech.getUserId())
                                .fullName(tech.getFullName())
                                .email(tech.getEmail())
                                .phone(tech.getPhone())
                                .avatarUrl(tech.getAvatarUrl())
                                .activeWorkCount(activeWorkCount)
                                .isAvailable(activeWorkCount < 3)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[ERROR] getAvailableTechnicians() - Lỗi: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
