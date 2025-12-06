package com.apexev.service.serviceImpl;

import com.apexev.dto.response.coreBussinessResponse.ServiceOrderDetailResponse;
import com.apexev.dto.response.coreBussinessResponse.ServiceOrderItemResponse;
import com.apexev.dto.response.coreBussinessResponse.ServiceOrderSummaryResponse;
import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.dto.response.financeAndReviewsResponse.ReviewResponse;
import com.apexev.entity.MaintenanceService;
import com.apexev.entity.Part;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.User;
import com.apexev.enums.OrderItemType;
import com.apexev.enums.OrderStatus;
import com.apexev.repository.coreBussiness.MaintenanceServiceRepository;
import com.apexev.repository.coreBussiness.PartRepository;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.service.service_Interface.ServiceOrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceOrderServiceImpl implements ServiceOrderService {
    private final ServiceOrderRepository serviceOrderRepository;
    private final ModelMapper modelMapper;

    // Inject thêm Repo để lấy tên
    private final PartRepository partRepository;
    private final MaintenanceServiceRepository maintenanceServiceRepository;

    // Lấy danh sách tóm tắt lịch sử đơn hàng
    @Override
    public List<ServiceOrderSummaryResponse> getMyMaintenanceHistory(User loggedInUser) {
        Integer customerId = loggedInUser.getUserId(); // (UserID là Integer)

        List<ServiceOrder> historyOrders = serviceOrderRepository
                .findByCustomerUserIdAndStatusOrderByCompletedAtDesc(customerId, OrderStatus.COMPLETED);

        // Dùng Stream để map sang DTO
        return historyOrders.stream()
                .map(this::convertOrderToSummaryDto) // Gọi hàm helper
                .collect(Collectors.toList());
    }

    @Override
    public ServiceOrderDetailResponse getMyOrderDetail(Long orderId, User loggedInUser) {
        Integer customerId = loggedInUser.getUserId();
        // Nếu không tìm thấy, nghĩa là "không tồn tại" hoặc "không phải của bạn".
        ServiceOrder order = serviceOrderRepository.findByIdAndCustomerUserId(orderId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn bảo dưỡng với ID: " + orderId));
        return convertOrderToDetailDto(order);
    }

    // Chuyển ServiceOrder (Entity) sang bản tóm tắt (DTO)
    private ServiceOrderSummaryResponse convertOrderToSummaryDto(ServiceOrder order) {
        ServiceOrderSummaryResponse dto = new ServiceOrderSummaryResponse();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setCompletedAt(order.getCompletedAt());
        dto.setVehicleLicensePlate(order.getVehicle().getLicensePlate());
        dto.setVehicleModel(order.getVehicle().getModel());

        // Lấy tổng tiền từ hóa đơn (nếu có)
        if (order.getInvoice() != null) {
            dto.setTotalAmount(order.getInvoice().getTotalAmount());
        }
        return dto;
    }

    // Chuyển ServiceOrder (Entity) sang bản chi tiết (DTO)
    // Đây là hàm phức tạp, phải map nhiều đối tượng con
    private ServiceOrderDetailResponse convertOrderToDetailDto(ServiceOrder order) {
        // 1. Map các trường cơ bản
        ServiceOrderDetailResponse detailDto = new ServiceOrderDetailResponse();
        detailDto.setId(order.getId());
        detailDto.setStatus(order.getStatus());
        detailDto.setCreatedAt(order.getCreatedAt());
        detailDto.setCompletedAt(order.getCompletedAt());

        // 2. Map thông tin lồng nhau (Khách, Xe)
        detailDto.setCustomerFullName(order.getCustomer().getFullName());
        detailDto.setCustomerPhone(order.getCustomer().getPhone());
        detailDto.setVehicleLicensePlate(order.getVehicle().getLicensePlate());
        detailDto.setVehicleBrand(order.getVehicle().getBrand());
        detailDto.setVehicleModel(order.getVehicle().getModel());

        // 3. Map nhân viên
        detailDto.setServiceAdvisorName(order.getServiceAdvisor().getFullName());
        if (order.getTechnician() != null) {
            detailDto.setTechnicianName(order.getTechnician().getFullName());
        }

        // 4. Map ghi chú
        detailDto.setCustomerDescription(order.getCustomerDescription());
        detailDto.setAdvisorNotes(order.getAdvisorNotes());
        detailDto.setTechnicianNotes(order.getTechnicianNotes());

        // 5. ⭐️ Map chi tiết Hóa đơn (dùng ModelMapper)
        if (order.getInvoice() != null) {
            detailDto.setInvoice(modelMapper.map(order.getInvoice(), InvoiceResponse.class));
        }

        // 6. ⭐️ Map chi tiết Đánh giá (dùng ModelMapper)
        // (Một đơn hàng có thể có nhiều đánh giá, nhưng ta giả sử chỉ lấy 1)
        if (order.getReviews() != null && !order.getReviews().isEmpty()) {
            detailDto.setReview(modelMapper.map(order.getReviews().iterator().next(), ReviewResponse.class));
        }

        // 7. ⭐️ Map danh sách Món hàng (Phức tạp, cần lấy tên)
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<ServiceOrderItemResponse> itemDtos = order.getOrderItems().stream()
                    .map(itemEntity -> {
                        ServiceOrderItemResponse itemDto = new ServiceOrderItemResponse();
                        itemDto.setItemType(itemEntity.getItemType());
                        itemDto.setQuantity(itemEntity.getQuantity());
                        itemDto.setUnitPrice(itemEntity.getUnitPrice());

                        // Lấy tên món hàng (Logic "hoàn hảo")
                        if (itemEntity.getItemType() == OrderItemType.SERVICE) {
                            itemDto.setItemName(
                                    maintenanceServiceRepository.findById(itemEntity.getItemRefId())
                                            .map(MaintenanceService::getName)
                                            .orElse("Dịch vụ không xác định"));
                        } else if (itemEntity.getItemType() == OrderItemType.PART) {
                            itemDto.setItemName(
                                    partRepository.findById(itemEntity.getItemRefId())
                                            .map(Part::getPartName)
                                            .orElse("Phụ tùng không xác định"));
                        }
                        return itemDto;
                    }).collect(Collectors.toList());

            detailDto.setItems(itemDtos);
        }

        return detailDto;
    }

}
