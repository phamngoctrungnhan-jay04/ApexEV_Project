package com.apexev.service.service_Interface;

import com.apexev.dto.request.CreateAppointmentRequest;
import com.apexev.dto.request.CreateServiceOrderRequest;
import com.apexev.dto.request.UpdateAppointmentRequest;
import com.apexev.dto.request.UpdateServiceOrderRequest;
import com.apexev.dto.request.SendQuotationRequest;
import com.apexev.dto.response.AppointmentResponse;
import com.apexev.dto.response.ServiceOrderResponse;
import com.apexev.dto.response.QuotationResponse;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface ServiceAdvisorService {
    
    // ========== Appointment Management ==========
    
    /**
     * Get all appointments assigned to a specific service advisor
     * @param advisorId The service advisor's user ID
     * @return List of appointments
     */
    List<AppointmentResponse> getAppointmentsByAdvisor(Long advisorId);
    
    /**
     * Get appointments by status
     * @param status The appointment status
     * @return List of appointments
     */
    List<AppointmentResponse> getAppointmentsByStatus(AppointmentStatus status);
    
    /**
     * Get appointments within a date range
     * @param start Start date time
     * @param end End date time
     * @return List of appointments
     */
    List<AppointmentResponse> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end);
    
    /**
     * Get appointment details by ID
     * @param appointmentId The appointment ID
     * @return Appointment details
     */
    AppointmentResponse getAppointmentById(Long appointmentId);
    
    /**
     * Create a new appointment (can be created by advisor on behalf of customer)
     * @param request Appointment creation request
     * @param advisorId The service advisor creating the appointment
     * @return Created appointment
     */
    AppointmentResponse createAppointment(CreateAppointmentRequest request, Long advisorId);
    
    /**
     * Update an existing appointment
     * @param appointmentId The appointment ID
     * @param request Update request
     * @param advisorId The service advisor updating the appointment
     * @return Updated appointment
     */
    AppointmentResponse updateAppointment(Long appointmentId, UpdateAppointmentRequest request, Long advisorId);
    
    /**
     * Confirm an appointment
     * @param appointmentId The appointment ID
     * @param advisorId The service advisor confirming the appointment
     * @return Updated appointment
     */
    AppointmentResponse confirmAppointment(Long appointmentId, Long advisorId);
    
    /**
     * Cancel an appointment
     * @param appointmentId The appointment ID
     * @param advisorId The service advisor canceling the appointment
     * @param reason Cancellation reason
     * @return Updated appointment
     */
    AppointmentResponse cancelAppointment(Long appointmentId, Long advisorId, String reason);
    
    /**
     * Assign service advisor to an appointment
     * @param appointmentId The appointment ID
     * @param advisorId The service advisor ID to assign
     * @return Updated appointment
     */
    AppointmentResponse assignAdvisorToAppointment(Long appointmentId, Long advisorId);
    
    // ========== Service Order Management (Service Intake) ==========
    
    /**
     * Get all service orders assigned to a specific service advisor
     * @param advisorId The service advisor's user ID
     * @return List of service orders
     */
    List<ServiceOrderResponse> getServiceOrdersByAdvisor(Long advisorId);
    
    /**
     * Get service orders by status
     * @param status The order status
     * @return List of service orders
     */
    List<ServiceOrderResponse> getServiceOrdersByStatus(OrderStatus status);
    
    /**
     * Get service order details by ID
     * @param orderId The service order ID
     * @return Service order details
     */
    ServiceOrderResponse getServiceOrderById(Long orderId);
    
    /**
     * Create a service intake form (Service Order) from an appointment
     * @param appointmentId The appointment ID
     * @param request Service order creation request
     * @param advisorId The service advisor creating the order
     * @return Created service order
     */
    ServiceOrderResponse createServiceOrderFromAppointment(Long appointmentId, CreateServiceOrderRequest request, Long advisorId);
    
    /**
     * Create a walk-in service intake form (without appointment)
     * @param request Service order creation request
     * @param advisorId The service advisor creating the order
     * @return Created service order
     */
    ServiceOrderResponse createWalkInServiceOrder(CreateServiceOrderRequest request, Long advisorId);
    
    /**
     * Update service order details
     * @param orderId The service order ID
     * @param request Update request
     * @param advisorId The service advisor updating the order
     * @return Updated service order
     */
    ServiceOrderResponse updateServiceOrder(Long orderId, UpdateServiceOrderRequest request, Long advisorId);
    
    /**
     * Add notes to service order
     * @param orderId The service order ID
     * @param advisorNotes Advisor's notes
     * @param advisorId The service advisor adding notes
     * @return Updated service order
     */
    ServiceOrderResponse addAdvisorNotes(Long orderId, String advisorNotes, Long advisorId);
    
    /**
     * Update service order status
     * @param orderId The service order ID
     * @param newStatus New status
     * @param advisorId The service advisor updating status
     * @return Updated service order
     */
    ServiceOrderResponse updateServiceOrderStatus(Long orderId, OrderStatus newStatus, Long advisorId);
    
    /**
     * Assign technician to service order
     * @param orderId The service order ID
     * @param technicianId The technician's user ID
     * @param advisorId The service advisor assigning the technician
     * @return Updated service order
     */
    ServiceOrderResponse assignTechnicianToOrder(Long orderId, Long technicianId, Long advisorId);
    
    // ========== Quotation Management ==========
    
    /**
     * Generate quotation for a service order
     * @param orderId The service order ID
     * @param request Quotation details (items, prices, etc.)
     * @param advisorId The service advisor creating quotation
     * @return Generated quotation
     */
    QuotationResponse createQuotation(Long orderId, SendQuotationRequest request, Long advisorId);
    
    /**
     * Update existing quotation
     * @param orderId The service order ID
     * @param request Updated quotation details
     * @param advisorId The service advisor updating quotation
     * @return Updated quotation
     */
    QuotationResponse updateQuotation(Long orderId, SendQuotationRequest request, Long advisorId);
    
    /**
     * Send quotation to customer via email
     * @param orderId The service order ID
     * @param advisorId The service advisor sending quotation
     * @return Quotation details
     */
    QuotationResponse sendQuotationToCustomer(Long orderId, Long advisorId);
    
    /**
     * Get quotation for a service order
     * @param orderId The service order ID
     * @return Quotation details
     */
    QuotationResponse getQuotationByOrderId(Long orderId);
    
    // ========== Progress Tracking ==========
    
    /**
     * Track service progress for a specific order
     * @param orderId The service order ID
     * @return Service order with current status and progress
     */
    ServiceOrderResponse trackServiceProgress(Long orderId);
    
    /**
     * Get service order history with status changes
     * @param orderId The service order ID
     * @return Service order history
     */
    List<String> getServiceOrderHistory(Long orderId);
}
