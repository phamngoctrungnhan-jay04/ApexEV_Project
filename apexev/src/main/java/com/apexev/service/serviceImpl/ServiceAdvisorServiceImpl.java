package com.apexev.service.serviceImpl;

import com.apexev.dto.request.*;
import com.apexev.dto.response.AppointmentResponse;
import com.apexev.dto.response.QuotationResponse;
import com.apexev.dto.response.ServiceOrderResponse;
import com.apexev.entity.*;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderItemType;
import com.apexev.enums.OrderStatus;
import com.apexev.repository.coreBussiness.AppointmentRepository;
import com.apexev.repository.coreBussiness.ServiceOrderItemRepository;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.userAndVehicle.UserRepository;
import com.apexev.repository.userAndVehicle.VehicleRepository;
import com.apexev.service.service_Interface.ServiceAdvisorService;
import com.apexev.service.service_Interface.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceAdvisorServiceImpl implements ServiceAdvisorService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceOrderRepository serviceOrderRepository;

    @Autowired
    private ServiceOrderItemRepository serviceOrderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private MailService mailService;

    // ========== Appointment Management ==========

    @Override
    public List<AppointmentResponse> getAppointmentsByAdvisor(Long advisorId) {
        List<Appointment> appointments = appointmentRepository
                .findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(advisorId.intValue());
        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByStatus(AppointmentStatus status) {
        List<Appointment> appointments = appointmentRepository.findByStatusOrderByAppointmentTimeAsc(status);
        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentTimeBetween(start, end);
        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse getAppointmentById(Long appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        return mapToAppointmentResponse(appointment);
    }

    @Override
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, Long advisorId) {
        User customer = findUserOrThrow(request.getCustomerId());
        Vehicle vehicle = findVehicleOrThrow(request.getVehicleId());
        User advisor = findUserOrThrow(advisorId);

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setVehicle(vehicle);
        appointment.setServiceAdvisor(advisor);
        appointment.setRequestedService(request.getRequestedService());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(AppointmentStatus.PENDING);

        appointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(appointment);
    }

    @Override
    public AppointmentResponse updateAppointment(Long appointmentId, UpdateAppointmentRequest request, Long advisorId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);

        if (request.getRequestedService() != null) {
            appointment.setRequestedService(request.getRequestedService());
        }
        if (request.getAppointmentTime() != null) {
            appointment.setAppointmentTime(request.getAppointmentTime());
        }
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        appointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(appointment);
    }

    @Override
    public AppointmentResponse confirmAppointment(Long appointmentId, Long advisorId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(appointment);
    }

    @Override
    public AppointmentResponse cancelAppointment(Long appointmentId, Long advisorId, String reason) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (reason != null) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "Cancelled: " + reason);
        }
        appointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(appointment);
    }

    @Override
    public AppointmentResponse assignAdvisorToAppointment(Long appointmentId, Long advisorId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        User advisor = findUserOrThrow(advisorId);
        appointment.setServiceAdvisor(advisor);
        appointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(appointment);
    }

    // ========== Service Order Management ==========

    @Override
    public List<ServiceOrderResponse> getServiceOrdersByAdvisor(Long advisorId) {
        List<ServiceOrder> orders = serviceOrderRepository.findByServiceAdvisorUserIdOrderByCreatedAtDesc(advisorId);
        return orders.stream()
                .map(this::mapToServiceOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOrderResponse> getServiceOrdersByStatus(OrderStatus status) {
        List<ServiceOrder> orders = serviceOrderRepository.findByStatus(status);
        return orders.stream()
                .map(this::mapToServiceOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceOrderResponse getServiceOrderById(Long orderId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse createServiceOrderFromAppointment(Long appointmentId, CreateServiceOrderRequest request, Long advisorId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        User advisor = findUserOrThrow(advisorId);

        ServiceOrder order = new ServiceOrder();
        order.setAppointment(appointment);
        order.setCustomer(appointment.getCustomer());
        order.setVehicle(appointment.getVehicle());
        order.setServiceAdvisor(advisor);
        order.setCustomerDescription(request.getCustomerDescription());
        order.setAdvisorNotes(request.getAdvisorNotes());
        order.setStatus(OrderStatus.RECEPTION);

        if (request.getTechnicianId() != null) {
            User technician = findUserOrThrow(request.getTechnicianId());
            order.setTechnician(technician);
        }

        order = serviceOrderRepository.save(order);

        // Update appointment status
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse createWalkInServiceOrder(CreateServiceOrderRequest request, Long advisorId) {
        User customer = findUserOrThrow(request.getCustomerId());
        Vehicle vehicle = findVehicleOrThrow(request.getVehicleId());
        User advisor = findUserOrThrow(advisorId);

        ServiceOrder order = new ServiceOrder();
        order.setCustomer(customer);
        order.setVehicle(vehicle);
        order.setServiceAdvisor(advisor);
        order.setCustomerDescription(request.getCustomerDescription());
        order.setAdvisorNotes(request.getAdvisorNotes());
        order.setStatus(OrderStatus.RECEPTION);

        if (request.getTechnicianId() != null) {
            User technician = findUserOrThrow(request.getTechnicianId());
            order.setTechnician(technician);
        }

        order = serviceOrderRepository.save(order);
        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse updateServiceOrder(Long orderId, UpdateServiceOrderRequest request, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);

        if (request.getCustomerDescription() != null) {
            order.setCustomerDescription(request.getCustomerDescription());
        }
        if (request.getAdvisorNotes() != null) {
            order.setAdvisorNotes(request.getAdvisorNotes());
        }
        if (request.getTechnicianNotes() != null) {
            order.setTechnicianNotes(request.getTechnicianNotes());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if (request.getStatus() == OrderStatus.COMPLETED) {
                order.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getTechnicianId() != null) {
            User technician = findUserOrThrow(request.getTechnicianId());
            order.setTechnician(technician);
        }

        order = serviceOrderRepository.save(order);
        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse addAdvisorNotes(Long orderId, String advisorNotes, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        order.setAdvisorNotes(advisorNotes);
        order = serviceOrderRepository.save(order);
        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse updateServiceOrderStatus(Long orderId, OrderStatus newStatus, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }
        order = serviceOrderRepository.save(order);
        return mapToServiceOrderResponse(order);
    }

    @Override
    public ServiceOrderResponse assignTechnicianToOrder(Long orderId, Long technicianId, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        User technician = findUserOrThrow(technicianId);
        order.setTechnician(technician);
        order = serviceOrderRepository.save(order);
        return mapToServiceOrderResponse(order);
    }

    // ========== Quotation Management ==========

    @Override
    public QuotationResponse createQuotation(Long orderId, SendQuotationRequest request, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);

        // Clear existing items and create new ones
        if (order.getOrderItems() != null) {
            serviceOrderItemRepository.deleteAll(order.getOrderItems());
        }

        List<ServiceOrderItem> items = new ArrayList<>();
        for (SendQuotationRequest.QuotationItemRequest itemReq : request.getItems()) {
            ServiceOrderItem item = new ServiceOrderItem();
            item.setServiceOrder(order);
            item.setItemType(OrderItemType.valueOf(itemReq.getItemType()));
            item.setItemRefId(itemReq.getItemRefId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(BigDecimal.valueOf(itemReq.getUnitPrice()));
            item.setStatus(OrderItemStatus.REQUESTED);
            items.add(item);
        }

        serviceOrderItemRepository.saveAll(items);

        return getQuotationByOrderId(orderId);
    }

    @Override
    public QuotationResponse updateQuotation(Long orderId, SendQuotationRequest request, Long advisorId) {
        return createQuotation(orderId, request, advisorId);
    }

    @Override
    public QuotationResponse sendQuotationToCustomer(Long orderId, Long advisorId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        QuotationResponse quotation = getQuotationByOrderId(orderId);

        // Build email content
        String emailBody = buildQuotationEmail(quotation);

        // Send email
        mailService.sendEmail(
                order.getCustomer().getEmail(),
                "Service Quotation - Order #" + orderId,
                emailBody, null
        );

        return quotation;
    }

    @Override
    public QuotationResponse getQuotationByOrderId(Long orderId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        List<ServiceOrderItem> items = serviceOrderItemRepository.findByServiceOrderId(orderId);

        QuotationResponse response = new QuotationResponse();
        response.setServiceOrderId(orderId);
        response.setCustomerId(order.getCustomer().getUserId().longValue());
        response.setCustomerName(order.getCustomer().getFullName());
        response.setCustomerEmail(order.getCustomer().getEmail());
        response.setVehicleLicensePlate(order.getVehicle().getLicensePlate());
        response.setVehicleModel(order.getVehicle().getModel());
        response.setQuotationDate(LocalDateTime.now());
        response.setSentToCustomer(false);

        List<QuotationResponse.QuotationItemResponse> quotationItems = items.stream()
                .map(item -> {
                    QuotationResponse.QuotationItemResponse itemResponse = new QuotationResponse.QuotationItemResponse();
                    itemResponse.setItemId(item.getId());
                    itemResponse.setItemType(item.getItemType().name());
                    itemResponse.setItemName("Item #" + item.getItemRefId());
                    itemResponse.setItemDescription("");
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice().doubleValue());
                    itemResponse.setLineTotal(item.getUnitPrice().doubleValue() * item.getQuantity());
                    itemResponse.setStatus(item.getStatus().name());
                    return itemResponse;
                })
                .collect(Collectors.toList());

        response.setItems(quotationItems);

        double subtotal = quotationItems.stream()
                .mapToDouble(QuotationResponse.QuotationItemResponse::getLineTotal)
                .sum();
        double tax = subtotal * 0.1; // 10% tax
        double total = subtotal + tax;

        response.setSubtotal(subtotal);
        response.setTax(tax);
        response.setTotalAmount(total);

        return response;
    }

    // ========== Progress Tracking ==========

    @Override
    public ServiceOrderResponse trackServiceProgress(Long orderId) {
        return getServiceOrderById(orderId);
    }

    @Override
    public List<String> getServiceOrderHistory(Long orderId) {
        ServiceOrder order = findServiceOrderOrThrow(orderId);
        List<String> history = new ArrayList<>();
        history.add("Order created at: " + order.getCreatedAt());
        history.add("Current status: " + order.getStatus());
        if (order.getCompletedAt() != null) {
            history.add("Completed at: " + order.getCompletedAt());
        }
        return history;
    }

    // ========== Helper Methods ==========

    private Appointment findAppointmentOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
    }

    private ServiceOrder findServiceOrderOrThrow(Long id) {
        return serviceOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service order not found: " + id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id.intValue())
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    private Vehicle findVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    private AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setCustomerId(appointment.getCustomer().getUserId().longValue());
        response.setCustomerName(appointment.getCustomer().getFullName());
        response.setCustomerEmail(appointment.getCustomer().getEmail());
        response.setCustomerPhone(appointment.getCustomer().getPhone());
        response.setVehicleId(appointment.getVehicle().getId());
        response.setVehicleLicensePlate(appointment.getVehicle().getLicensePlate());
        response.setVehicleModel(appointment.getVehicle().getModel());
        response.setVehicleBrand(appointment.getVehicle().getBrand());
        response.setRequestedService(appointment.getRequestedService());
        response.setAppointmentTime(appointment.getAppointmentTime());
        response.setStatus(appointment.getStatus());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());

        if (appointment.getServiceAdvisor() != null) {
            response.setServiceAdvisorId(appointment.getServiceAdvisor().getUserId().longValue());
            response.setServiceAdvisorName(appointment.getServiceAdvisor().getFullName());
        }

        if (appointment.getServiceOrder() != null) {
            response.setServiceOrderId(appointment.getServiceOrder().getId());
        }

        return response;
    }

    private ServiceOrderResponse mapToServiceOrderResponse(ServiceOrder order) {
        ServiceOrderResponse response = new ServiceOrderResponse();
        response.setId(order.getId());
        response.setCustomerId(order.getCustomer().getUserId().longValue());
        response.setCustomerName(order.getCustomer().getFullName());
        response.setCustomerEmail(order.getCustomer().getEmail());
        response.setCustomerPhone(order.getCustomer().getPhone());
        response.setVehicleId(order.getVehicle().getId());
        response.setVehicleLicensePlate(order.getVehicle().getLicensePlate());
        response.setVehicleModel(order.getVehicle().getModel());
        response.setVehicleBrand(order.getVehicle().getBrand());
        response.setStatus(order.getStatus());
        response.setCustomerDescription(order.getCustomerDescription());
        response.setAdvisorNotes(order.getAdvisorNotes());
        response.setTechnicianNotes(order.getTechnicianNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setCompletedAt(order.getCompletedAt());

        if (order.getServiceAdvisor() != null) {
            response.setServiceAdvisorId(order.getServiceAdvisor().getUserId().longValue());
            response.setServiceAdvisorName(order.getServiceAdvisor().getFullName());
        }

        if (order.getTechnician() != null) {
            response.setTechnicianId(order.getTechnician().getUserId().longValue());
            response.setTechnicianName(order.getTechnician().getFullName());
        }

        if (order.getAppointment() != null) {
            response.setAppointmentId(order.getAppointment().getId());
        }

        // Map order items
        List<ServiceOrderItem> items = serviceOrderItemRepository.findByServiceOrderId(order.getId());
        List<ServiceOrderResponse.ServiceOrderItemResponse> itemResponses = items.stream()
                .map(item -> {
                    ServiceOrderResponse.ServiceOrderItemResponse itemResponse = 
                            new ServiceOrderResponse.ServiceOrderItemResponse();
                    itemResponse.setItemId(item.getId());
                    itemResponse.setItemType(item.getItemType().name());
                    itemResponse.setItemRefId(item.getItemRefId());
                    itemResponse.setItemName("Item #" + item.getItemRefId());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice().doubleValue());
                    itemResponse.setStatus(item.getStatus().name());
                    return itemResponse;
                })
                .collect(Collectors.toList());

        response.setOrderItems(itemResponses);

        // Calculate estimated total
        double total = itemResponses.stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
        response.setEstimatedTotal(total);

        return response;
    }

    private String buildQuotationEmail(QuotationResponse quotation) {
        StringBuilder sb = new StringBuilder();
        sb.append("Dear ").append(quotation.getCustomerName()).append(",\n\n");
        sb.append("Thank you for choosing our service. Please find your quotation below:\n\n");
        sb.append("Vehicle: ").append(quotation.getVehicleModel())
                .append(" (").append(quotation.getVehicleLicensePlate()).append(")\n\n");
        sb.append("Services/Parts:\n");

        for (QuotationResponse.QuotationItemResponse item : quotation.getItems()) {
            sb.append("- ").append(item.getItemName())
                    .append(" x").append(item.getQuantity())
                    .append(" @ $").append(String.format("%.2f", item.getUnitPrice()))
                    .append(" = $").append(String.format("%.2f", item.getLineTotal())).append("\n");
        }

        sb.append("\nSubtotal: $").append(String.format("%.2f", quotation.getSubtotal())).append("\n");
        sb.append("Tax: $").append(String.format("%.2f", quotation.getTax())).append("\n");
        sb.append("Total: $").append(String.format("%.2f", quotation.getTotalAmount())).append("\n\n");

        if (quotation.getAdditionalNotes() != null) {
            sb.append("Notes: ").append(quotation.getAdditionalNotes()).append("\n\n");
        }

        sb.append("If you have any questions, please don't hesitate to contact us.\n\n");
        sb.append("Best regards,\nApexEV Service Team");

        return sb.toString();
    }
}
