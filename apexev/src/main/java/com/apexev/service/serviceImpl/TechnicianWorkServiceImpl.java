package com.apexev.service.serviceImpl;

import com.apexev.dto.request.technicianRequest.AddTechnicianNotesRequest;
import com.apexev.dto.request.technicianRequest.UpdateWorkStatusRequest;
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

    @Override
    public List<TechnicianWorkResponse> getMyAssignedWorks(User technician) {
        // Kiểm tra role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể xem danh sách công việc.");
        }

        // Lấy danh sách công việc (loại trừ COMPLETED và CANCELLED)
        List<ServiceOrder> works = serviceOrderRepository
                .findByTechnicianUserIdAndStatusNot(technician.getUserId().longValue(), OrderStatus.COMPLETED);

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
            case INSPECTION:
                // Từ INSPECTION có thể chuyển sang QUOTING hoặc IN_PROGRESS
                isValidTransition = (newStatus == OrderStatus.QUOTING || newStatus == OrderStatus.IN_PROGRESS);
                break;
            case QUOTING:
                // Từ QUOTING chỉ có thể chuyển sang IN_PROGRESS (sau khi customer approve)
                isValidTransition = (newStatus == OrderStatus.IN_PROGRESS);
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

                    // Lấy tên item
                    if (item.getItemType() == OrderItemType.SERVICE) {
                        itemDto.setItemName(
                                maintenanceServiceRepository.findById(item.getItemRefId())
                                        .map(MaintenanceService::getName)
                                        .orElse("Dịch vụ không xác định"));
                    } else if (item.getItemType() == OrderItemType.PART) {
                        itemDto.setItemName(
                                partRepository.findById(item.getItemRefId())
                                        .map(Part::getPartName)
                                        .orElse("Phụ tùng không xác định"));
                    }

                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setOrderItems(itemDtos);

        return dto;
    }
}
