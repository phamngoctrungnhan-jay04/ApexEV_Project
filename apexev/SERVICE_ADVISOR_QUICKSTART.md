# Service Advisor Module - Quick Start Guide

## Overview
This guide will help you quickly understand and start working with the Service Advisor Module.

## What's Already Done ✅

### 1. Service Interface
`ServiceAdvisorService.java` - Defines all 20+ methods needed

### 2. DTOs (5 Request + 3 Response classes)
All validation annotations included

### 3. REST Controller
`ServiceAdvisorController.java` - 30+ endpoints with Swagger docs

### 4. Documentation
Complete API documentation with examples

## What You Need to Do 🔨

### Step 1: Create Service Implementation
Create: `src/main/java/com/apexev/service/serviceIplm/ServiceAdvisorServiceImpl.java`

```java
package com.apexev.service.serviceIplm;

import com.apexev.service.ServiceAdvisorService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
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
    
    // Implement all methods from ServiceAdvisorService interface
    
    @Override
    public List<AppointmentResponse> getAppointmentsByAdvisor(Long advisorId) {
        List<Appointment> appointments = appointmentRepository
            .findByServiceAdvisorUserIdOrderByAppointmentTimeAsc(advisorId);
        return appointments.stream()
            .map(this::mapToAppointmentResponse)
            .collect(Collectors.toList());
    }
    
    // ... implement other methods
    
    // Helper method to map entity to DTO
    private AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setCustomerId(appointment.getCustomer().getUserId().longValue());
        response.setCustomerName(appointment.getCustomer().getFullName());
        // ... map other fields
        return response;
    }
}
```

### Step 2: Add Repository for Service Order Items
Check if `ServiceOrderItemRepository` exists. If not, create it:

```java
package com.apexev.repository.coreBussiness;

import com.apexev.entity.ServiceOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceOrderItemRepository extends JpaRepository<ServiceOrderItem, Long> {
    List<ServiceOrderItem> findByServiceOrderId(Long serviceOrderId);
}
```

### Step 3: Create Mapper Utilities (Optional but Recommended)
Create: `src/main/java/com/apexev/util/ServiceAdvisorMapper.java`

```java
package com.apexev.util;

import com.apexev.dto.response.*;
import com.apexev.entity.*;
import org.springframework.stereotype.Component;

@Component
public class ServiceAdvisorMapper {
    
    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        // Mapping logic
    }
    
    public ServiceOrderResponse toServiceOrderResponse(ServiceOrder order) {
        // Mapping logic
    }
    
    public QuotationResponse toQuotationResponse(ServiceOrder order) {
        // Mapping logic
    }
}
```

### Step 4: Add Custom Exceptions
Create: `src/main/java/com/apexev/exception/ServiceAdvisorException.java`

```java
package com.apexev.exception;

public class AppointmentNotFoundException extends RuntimeException {
    public AppointmentNotFoundException(String message) {
        super(message);
    }
}

public class ServiceOrderNotFoundException extends RuntimeException {
    public ServiceOrderNotFoundException(String message) {
        super(message);
    }
}

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
```

### Step 5: Update UserRole Enum (if needed)
Ensure `SERVICE_ADVISOR` role exists in `UserRole.java`:

```java
public enum UserRole {
    CUSTOMER,
    ADMIN,
    SERVICE_ADVISOR,  // Add this if not present
    TECHNICIAN,
    BUSINESS_MANAGER
}
```

## Testing Your Implementation

### 1. Start the Application
```bash
mvn spring-boot:run
```

### 2. Access Swagger UI
Open browser: `http://localhost:8080/swagger-ui.html`

### 3. Test Endpoints

#### A. Login as Service Advisor
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "advisor@apexev.com",
  "password": "password123"
}
```
Copy the `accessToken` from response.

#### B. Create Appointment
```bash
POST http://localhost:8080/api/service-advisor/appointments
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "customerId": 1,
  "vehicleId": 1,
  "requestedService": "Oil change and tire rotation",
  "appointmentTime": "2025-11-25T10:00:00",
  "notes": "Customer prefers morning"
}
```

#### C. Get My Appointments
```bash
GET http://localhost:8080/api/service-advisor/appointments/my-appointments
Authorization: Bearer <your-token>
```

## Common Implementation Patterns

### Pattern 1: Authorization Check
```java
private void validateAdvisorAccess(Long advisorId, Long requestingUserId) {
    if (!advisorId.equals(requestingUserId)) {
        throw new UnauthorizedAccessException("Not authorized to access this resource");
    }
}
```

### Pattern 2: Entity Not Found
```java
private Appointment findAppointmentOrThrow(Long id) {
    return appointmentRepository.findById(id)
        .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found: " + id));
}
```

### Pattern 3: Send Email Quotation
```java
@Override
public QuotationResponse sendQuotationToCustomer(Long orderId, Long advisorId) {
    ServiceOrder order = findServiceOrderOrThrow(orderId);
    QuotationResponse quotation = generateQuotation(order);
    
    // Create email content
    String emailBody = buildQuotationEmail(quotation);
    
    // Send email using MailService
    mailService.sendEmail(
        order.getCustomer().getEmail(),
        "Service Quotation - Order #" + orderId,
        emailBody
    );
    
    return quotation;
}
```

### Pattern 4: Calculate Quotation Total
```java
private Double calculateQuotationTotal(List<ServiceOrderItem> items) {
    return items.stream()
        .map(item -> item.getUnitPrice().doubleValue() * item.getQuantity())
        .reduce(0.0, Double::sum);
}
```

## Troubleshooting

### Issue: "Role SERVICE_ADVISOR not found"
**Solution**: Add SERVICE_ADVISOR to UserRole enum and update SecurityConfig

### Issue: "Could not autowire ServiceAdvisorService"
**Solution**: Ensure ServiceAdvisorServiceImpl has @Service annotation

### Issue: "Access Denied"
**Solution**: Check @PreAuthorize annotations match user's role

### Issue: "Appointment not found"
**Solution**: Verify appointment ID exists in database

## Database Setup

### Ensure these tables exist:
- `appointments`
- `service_orders`
- `service_order_items`
- `users`
- `vehicles`

### Sample test data:
```sql
-- Create service advisor user
INSERT INTO users (full_name, email, phone, password, role, enabled) 
VALUES ('John Advisor', 'advisor@apexev.com', '1234567890', '$2a$10$...', 'SERVICE_ADVISOR', true);

-- Create customer
INSERT INTO users (full_name, email, phone, password, role, enabled) 
VALUES ('Jane Customer', 'customer@test.com', '0987654321', '$2a$10$...', 'CUSTOMER', true);

-- Create vehicle
INSERT INTO vehicles (license_plate, model, brand, customer_id) 
VALUES ('ABC123', 'Model 3', 'Tesla', 2);
```

## Key Files to Review

1. **Entity Classes**: `Appointment.java`, `ServiceOrder.java`, `ServiceOrderItem.java`
2. **Repositories**: `AppointmentRepository.java`, `ServiceOrderRepository.java`
3. **Mail Service**: `MailService.java` - for sending quotations
4. **Security Config**: Check role configurations

## Best Practices

### ✅ DO:
- Always validate user authorization
- Use transactions for multi-step operations
- Return proper HTTP status codes
- Log important actions
- Handle exceptions gracefully
- Use DTOs for API responses (never expose entities)

### ❌ DON'T:
- Return entity objects directly in API responses
- Skip input validation
- Ignore null checks
- Use raw SQL when JPA methods are available
- Hardcode email templates

## Next Features to Consider

1. **Appointment Reminders**: Auto-send email reminders 24h before appointment
2. **SMS Notifications**: Integrate SMS service for status updates
3. **Calendar Integration**: Export appointments to calendar
4. **Analytics Dashboard**: Service advisor performance metrics
5. **Customer Feedback**: Auto-request feedback after service completion
6. **Mobile API**: Optimize endpoints for mobile app
7. **Real-time Updates**: WebSocket for live status updates
8. **PDF Quotations**: Generate PDF quotations
9. **Multi-language Support**: i18n for email templates
10. **Audit Logs**: Track all changes for compliance

## Support & Documentation

- **Full API Docs**: See `SERVICE_ADVISOR_MODULE.md`
- **Files Summary**: See `SERVICE_ADVISOR_FILES_SUMMARY.md`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

## Quick Reference - HTTP Status Codes

- `200 OK` - Successful GET/PUT/POST
- `201 Created` - Resource created (POST)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized for this action
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## Estimated Implementation Time

- **Service Implementation**: 4-6 hours
- **Mapper Utilities**: 1-2 hours
- **Exception Handling**: 1 hour
- **Testing**: 2-3 hours
- **Total**: ~8-12 hours for complete implementation

Good luck! 🚀
