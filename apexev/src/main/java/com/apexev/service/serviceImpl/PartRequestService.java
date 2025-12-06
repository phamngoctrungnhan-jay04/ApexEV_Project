package com.apexev.service.serviceImpl;

import com.apexev.dto.request.technicianRequest.CreatePartRequestRequest;
import com.apexev.dto.response.technicianResponse.PartRequestResponse;
import com.apexev.dto.response.technicianResponse.PartResponse;
import com.apexev.entity.Part;
import com.apexev.entity.PartRequest;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.ServiceOrderItem;
import com.apexev.entity.User;
import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderItemType;
import com.apexev.enums.PartRequestStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.PartRepository;
import com.apexev.repository.coreBussiness.PartRequestRepository;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartRequestService {

    private final PartRepository partRepository;
    private final PartRequestRepository partRequestRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách tất cả phụ tùng
     */
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::convertPartToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm phụ tùng
     */
    public List<PartResponse> searchParts(String keyword) {
        // Simple search by name or SKU
        return partRepository.findAll().stream()
                .filter(part -> part.getPartName().toLowerCase().contains(keyword.toLowerCase()) ||
                        (part.getSku() != null && part.getSku().toLowerCase().contains(keyword.toLowerCase())))
                .map(this::convertPartToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Technician tạo yêu cầu phụ tùng
     */
    @Transactional
    public PartRequestResponse createPartRequest(CreatePartRequestRequest request, User technician) {
        // Validate technician role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể tạo yêu cầu phụ tùng");
        }

        // Tìm service order
        ServiceOrder serviceOrder = serviceOrderRepository.findById(request.getServiceOrderId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy service order với ID: " + request.getServiceOrderId()));

        // Kiểm tra technician có được assign cho order này không
        if (serviceOrder.getTechnician() == null ||
                !serviceOrder.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new AccessDeniedException("Bạn không được phân công cho đơn hàng này");
        }

        // Tìm part
        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Không tìm thấy phụ tùng với ID: " + request.getPartId()));

        // Tạo part request
        PartRequest partRequest = new PartRequest();
        partRequest.setTechnician(technician);
        partRequest.setServiceOrder(serviceOrder);
        partRequest.setPart(part);
        partRequest.setQuantityRequested(request.getQuantity());
        partRequest.setUrgency(request.getUrgency() != null ? request.getUrgency() : "NORMAL");
        partRequest.setTechnicianNotes(request.getNotes());
        partRequest.setStatus(PartRequestStatus.PENDING);

        partRequest = partRequestRepository.save(partRequest);
        log.info("Created part request: id={}, partId={}, orderId={}, technicianId={}",
                partRequest.getId(), part.getId(), serviceOrder.getId(), technician.getUserId());

        return convertToResponse(partRequest);
    }

    /**
     * Lấy danh sách yêu cầu của technician
     */
    public List<PartRequestResponse> getMyPartRequests(User technician) {
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể xem yêu cầu phụ tùng");
        }

        return partRequestRepository.findByTechnicianUserIdOrderByCreatedAtDesc(technician.getUserId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy yêu cầu theo service order
     */
    public List<PartRequestResponse> getPartRequestsByOrder(Long serviceOrderId, User user) {
        // Validate access
        ServiceOrder serviceOrder = serviceOrderRepository.findById(serviceOrderId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Không tìm thấy service order với ID: " + serviceOrderId));

        if (user.getRole() == UserRole.TECHNICIAN) {
            if (serviceOrder.getTechnician() == null ||
                    !serviceOrder.getTechnician().getUserId().equals(user.getUserId())) {
                throw new AccessDeniedException("Bạn không có quyền xem yêu cầu phụ tùng của đơn hàng này");
            }
        }

        return partRequestRepository.findByServiceOrderIdOrderByCreatedAtDesc(serviceOrderId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả yêu cầu đang chờ duyệt (cho Service Advisor/Admin)
     */
    public List<PartRequestResponse> getPendingPartRequests(User user) {
        if (user.getRole() != UserRole.SERVICE_ADVISOR && user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Bạn không có quyền xem yêu cầu chờ duyệt");
        }

        return partRequestRepository.findByStatusOrderByCreatedAtDesc(PartRequestStatus.PENDING)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Duyệt/Từ chối yêu cầu (Service Advisor/Admin)
     * Khi DUYỆT: Tự động xuất kho (trừ số lượng) và cập nhật status = FULFILLED
     */
    @Transactional
    public PartRequestResponse approveOrRejectPartRequest(Long requestId, boolean approve, String notes,
            User approver) {
        if (approver.getRole() != UserRole.SERVICE_ADVISOR && approver.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Bạn không có quyền duyệt yêu cầu");
        }

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu với ID: " + requestId));

        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Yêu cầu này đã được xử lý");
        }

        partRequest.setApprovedBy(approver);
        partRequest.setApproverNotes(notes);
        partRequest.setApprovedAt(LocalDateTime.now());

        if (approve) {
            // === TỰ ĐỘNG XUẤT KHO KHI DUYỆT ===
            Part part = partRequest.getPart();
            int requestedQty = partRequest.getQuantityRequested();
            int currentStock = part.getQuantityInStock();

            // Kiểm tra tồn kho
            if (currentStock < requestedQty) {
                throw new IllegalStateException(
                        String.format("Không đủ tồn kho! Yêu cầu: %d, Tồn kho: %d (%s)",
                                requestedQty, currentStock, part.getPartName()));
            }

            // Trừ số lượng tồn kho
            part.setQuantityInStock(currentStock - requestedQty);
            partRepository.save(part);

            log.info("Auto deducted stock: partId={}, partName={}, qty={}, oldStock={}, newStock={}",
                    part.getId(), part.getPartName(), requestedQty, currentStock, part.getQuantityInStock());

            // === TỰ ĐỘNG TẠO ServiceOrderItem ĐỂ GHI VÀO HÓA ĐƠN ===
            ServiceOrder serviceOrder = partRequest.getServiceOrder();
            ServiceOrderItem orderItem = new ServiceOrderItem();
            orderItem.setItemType(OrderItemType.PART);
            orderItem.setItemRefId(part.getId());
            orderItem.setQuantity(requestedQty);
            orderItem.setUnitPrice(part.getPrice()); // Giá tại thời điểm duyệt
            orderItem.setStatus(OrderItemStatus.APPROVED);
            orderItem.setServiceOrder(serviceOrder);

            // Thêm vào ServiceOrder
            serviceOrder.getOrderItems().add(orderItem);
            serviceOrderRepository.save(serviceOrder);

            log.info("Auto created ServiceOrderItem: orderId={}, partId={}, partName={}, qty={}, unitPrice={}",
                    serviceOrder.getId(), part.getId(), part.getPartName(), requestedQty, part.getPrice());

            // Cập nhật status = FULFILLED (đã xuất kho, sẵn sàng giao cho KTV)
            partRequest.setStatus(PartRequestStatus.FULFILLED);

            log.info("Approved & fulfilled part request: id={}, approver={}, partId={}, qty={}",
                    requestId, approver.getUserId(), part.getId(), requestedQty);
        } else {
            // Từ chối
            partRequest.setStatus(PartRequestStatus.REJECTED);
            log.info("Rejected part request: id={}, approver={}, reason={}",
                    requestId, approver.getUserId(), notes);
        }

        partRequest = partRequestRepository.save(partRequest);

        return convertToResponse(partRequest);
    }

    /**
     * Hủy yêu cầu (Technician)
     */
    @Transactional
    public PartRequestResponse cancelPartRequest(Long requestId, User technician) {
        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu với ID: " + requestId));

        // Chỉ technician tạo mới có thể hủy
        if (!partRequest.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền hủy yêu cầu này");
        }

        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể hủy yêu cầu đang chờ duyệt");
        }

        partRequest.setStatus(PartRequestStatus.CANCELLED);
        partRequest = partRequestRepository.save(partRequest);

        return convertToResponse(partRequest);
    }

    // === Helper Methods ===

    private PartResponse convertPartToResponse(Part part) {
        return PartResponse.builder()
                .id(part.getId())
                .partName(part.getPartName())
                .sku(part.getSku())
                .description(part.getDescription())
                .quantityInStock(part.getQuantityInStock())
                .price(part.getPrice())
                .isAvailable(part.getQuantityInStock() > 0)
                .build();
    }

    private PartRequestResponse convertToResponse(PartRequest request) {
        PartRequestResponse response = PartRequestResponse.builder()
                .id(request.getId())
                .partId(request.getPart().getId())
                .partName(request.getPart().getPartName())
                .partSku(request.getPart().getSku())
                .partPrice(request.getPart().getPrice())
                .quantityInStock(request.getPart().getQuantityInStock())
                .quantityRequested(request.getQuantityRequested())
                .urgency(request.getUrgency())
                .technicianNotes(request.getTechnicianNotes())
                .status(request.getStatus())
                .serviceOrderId(request.getServiceOrder().getId())
                .vehicleLicensePlate(request.getServiceOrder().getVehicle().getLicensePlate())
                .customerName(request.getServiceOrder().getCustomer().getFullName())
                .technicianId(request.getTechnician().getUserId())
                .technicianName(request.getTechnician().getFullName())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();

        if (request.getApprovedBy() != null) {
            response.setApprovedById(request.getApprovedBy().getUserId());
            response.setApprovedByName(request.getApprovedBy().getFullName());
            response.setApproverNotes(request.getApproverNotes());
            response.setApprovedAt(request.getApprovedAt());
        }

        return response;
    }
}
