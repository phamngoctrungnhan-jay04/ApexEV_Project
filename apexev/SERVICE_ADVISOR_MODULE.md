# Service Advisor Module - API Documentation

## Overview
The Service Advisor Module provides comprehensive functionality for managing appointments, creating service intake forms, tracking service progress, and sending quotations to customers.

## Technology Stack
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: MySQL with JPA/Hibernate
- **Security**: Spring Security + JWT Authentication
- **API Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven
- **Additional Libraries**: 
  - Lombok (for reducing boilerplate code)
  - Jakarta Mail (for email functionality)
  - Apache POI (for Excel operations)

## Module Components

### 1. Service Interface
**Location**: `src/main/java/com/apexev/service/ServiceAdvisorService.java`

The interface defines all business logic methods for:
- Appointment management
- Service order (intake form) management
- Quotation generation and sending
- Service progress tracking

### 2. DTOs (Data Transfer Objects)

#### Request DTOs
Located in: `src/main/java/com/apexev/dto/request/`

- **CreateAppointmentRequest**: Create new appointments
  - customerId, vehicleId, requestedService, appointmentTime, notes

- **UpdateAppointmentRequest**: Update existing appointments
  - requestedService, appointmentTime, status, notes

- **CreateServiceOrderRequest**: Create service intake forms
  - customerId, vehicleId, customerDescription, advisorNotes, technicianId (optional)

- **UpdateServiceOrderRequest**: Update service orders
  - customerDescription, advisorNotes, technicianNotes, status, technicianId

- **SendQuotationRequest**: Create/send quotations
  - items (List of QuotationItemRequest), additionalNotes

#### Response DTOs
Located in: `src/main/java/com/apexev/dto/response/`

- **AppointmentResponse**: Appointment details with customer and vehicle info
- **ServiceOrderResponse**: Service order details with items and progress
- **QuotationResponse**: Quotation details with pricing breakdown

### 3. REST Controller
**Location**: `src/main/java/com/apexev/controller/ServiceAdvisorController.java`

Base URL: `/api/service-advisor`

## API Endpoints

### Appointment Management

#### Get My Appointments
```
GET /api/service-advisor/appointments/my-appointments
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
```
Returns all appointments assigned to the logged-in service advisor.

#### Get Appointments by Status
```
GET /api/service-advisor/appointments/status/{status}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
Path Variable: status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
```

#### Get Appointments by Date Range
```
GET /api/service-advisor/appointments/date-range?start=<datetime>&end=<datetime>
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
Query Parameters:
  - start: ISO DateTime format (e.g., 2025-11-19T08:00:00)
  - end: ISO DateTime format
```

#### Get Appointment Details
```
GET /api/service-advisor/appointments/{appointmentId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
```

#### Create New Appointment
```
POST /api/service-advisor/appointments
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "customerId": 123,
  "vehicleId": 456,
  "requestedService": "Oil change and tire rotation",
  "appointmentTime": "2025-11-25T10:00:00",
  "notes": "Customer prefers morning appointment"
}
```

#### Update Appointment
```
PUT /api/service-advisor/appointments/{appointmentId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "requestedService": "Oil change, tire rotation, and brake inspection",
  "appointmentTime": "2025-11-25T14:00:00",
  "status": "CONFIRMED",
  "notes": "Updated appointment time"
}
```

#### Confirm Appointment
```
POST /api/service-advisor/appointments/{appointmentId}/confirm
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
```

#### Cancel Appointment
```
POST /api/service-advisor/appointments/{appointmentId}/cancel
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "reason": "Customer requested cancellation"
}
```

#### Assign Advisor to Appointment
```
POST /api/service-advisor/appointments/{appointmentId}/assign-advisor
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
Content-Type: application/json

Body:
{
  "advisorId": 789
}
```

### Service Order Management (Service Intake Forms)

#### Get My Service Orders
```
GET /api/service-advisor/service-orders/my-orders
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
```

#### Get Service Orders by Status
```
GET /api/service-advisor/service-orders/status/{status}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
Path Variable: status (RECEPTION, INSPECTION, WAITING_FOR_PARTS, IN_PROGRESS, COMPLETED, CANCELLED)
```

#### Get Service Order Details
```
GET /api/service-advisor/service-orders/{orderId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER, TECHNICIAN
```

#### Create Service Order from Appointment
```
POST /api/service-advisor/service-orders/from-appointment/{appointmentId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "customerId": 123,
  "vehicleId": 456,
  "customerDescription": "Engine making strange noise, brake pedal feels soft",
  "advisorNotes": "Customer mentioned noise started 2 days ago",
  "technicianId": 789
}
```

#### Create Walk-in Service Order (No Appointment)
```
POST /api/service-advisor/service-orders/walk-in
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "customerId": 123,
  "vehicleId": 456,
  "customerDescription": "Routine maintenance check",
  "advisorNotes": "Customer arrived without appointment"
}
```

#### Update Service Order
```
PUT /api/service-advisor/service-orders/{orderId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "customerDescription": "Updated description after inspection",
  "advisorNotes": "Additional work required",
  "status": "INSPECTION",
  "technicianId": 789
}
```

#### Add Advisor Notes
```
POST /api/service-advisor/service-orders/{orderId}/notes
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "notes": "Customer requested priority service"
}
```

#### Update Service Order Status
```
POST /api/service-advisor/service-orders/{orderId}/status
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "status": "IN_PROGRESS"
}
```

#### Assign Technician
```
POST /api/service-advisor/service-orders/{orderId}/assign-technician
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "technicianId": 789
}
```

#### Track Service Progress
```
GET /api/service-advisor/service-orders/{orderId}/track
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, CUSTOMER, ADMIN
```
Returns current status and progress of the service order.

#### Get Service Order History
```
GET /api/service-advisor/service-orders/{orderId}/history
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
```
Returns the history of all status changes and updates.

### Quotation Management

#### Create Quotation
```
POST /api/service-advisor/quotations/{orderId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body:
{
  "items": [
    {
      "itemType": "SERVICE",
      "itemRefId": 101,
      "itemName": "Oil Change",
      "itemDescription": "Synthetic oil change with filter",
      "quantity": 1,
      "unitPrice": 79.99
    },
    {
      "itemType": "PART",
      "itemRefId": 202,
      "itemName": "Air Filter",
      "itemDescription": "Cabin air filter replacement",
      "quantity": 1,
      "unitPrice": 29.99
    }
  ],
  "additionalNotes": "Prices include labor and materials"
}
```

#### Update Quotation
```
PUT /api/service-advisor/quotations/{orderId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
Content-Type: application/json

Body: (same as Create Quotation)
```

#### Send Quotation to Customer
```
POST /api/service-advisor/quotations/{orderId}/send
Authorization: Bearer <token>
Role: SERVICE_ADVISOR
```
Sends the quotation to the customer's email address.

#### Get Quotation
```
GET /api/service-advisor/quotations/{orderId}
Authorization: Bearer <token>
Role: SERVICE_ADVISOR, CUSTOMER, ADMIN, BUSINESS_MANAGER
```

## Data Models

### Appointment Status Enum
- `PENDING` - Waiting for confirmation
- `CONFIRMED` - Confirmed by service advisor
- `CANCELLED` - Cancelled by customer or advisor
- `COMPLETED` - Service completed

### Order Status Enum
- `RECEPTION` - Initial intake
- `INSPECTION` - Vehicle being inspected
- `WAITING_FOR_PARTS` - Waiting for parts to arrive
- `IN_PROGRESS` - Service work in progress
- `COMPLETED` - Service completed
- `CANCELLED` - Order cancelled

### Order Item Status Enum
- `REQUESTED` - Item requested in quotation
- `APPROVED` - Customer approved the item
- `REJECTED` - Customer rejected the item

## Security

All endpoints require JWT authentication. The token must be included in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Role-based access control is enforced:
- **SERVICE_ADVISOR**: Can manage appointments, service orders, and quotations
- **ADMIN**: Full access to all endpoints
- **BUSINESS_MANAGER**: Can view and manage appointments and service orders
- **TECHNICIAN**: Can view service order details
- **CUSTOMER**: Can track their service progress and view quotations

## Error Handling

The API returns standard HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a JSON body with error details:
```json
{
  "error": "Error message description"
}
```

## Testing

Access the Swagger UI for interactive API testing:
```
http://localhost:8080/swagger-ui.html
```

## Implementation Notes

1. **Service Implementation**: The service interface needs to be implemented in `ServiceAdvisorServiceImpl.java` located in the `serviceIplm` package.

2. **Email Integration**: The quotation sending functionality should integrate with the existing `MailService` to send formatted quotation emails to customers.

3. **Repository Usage**: The implementation should use existing repositories:
   - `AppointmentRepository` for appointment operations
   - `ServiceOrderRepository` for service order operations
   - Additional repositories may be needed for service order items and quotations

4. **Validation**: All request DTOs include Jakarta Bean Validation annotations for input validation.

5. **Audit Trail**: Consider implementing an audit log for service order history tracking.

## Next Steps

To complete the implementation:

1. Create `ServiceAdvisorServiceImpl` class implementing the `ServiceAdvisorService` interface
2. Implement business logic for each method
3. Add proper exception handling with custom exception classes
4. Integrate with the existing `MailService` for sending quotations
5. Add unit and integration tests
6. Update database schema if needed for quotation storage
7. Consider adding DTOs mapper utilities for entity-to-DTO conversions

## Example Usage Flow

### Typical Service Advisor Workflow:

1. **Customer calls to book appointment**
   - Service advisor creates appointment using `POST /appointments`

2. **Appointment confirmed**
   - Service advisor confirms using `POST /appointments/{id}/confirm`

3. **Customer arrives for service**
   - Service advisor creates service intake form using `POST /service-orders/from-appointment/{appointmentId}`

4. **Initial inspection completed**
   - Service advisor updates status to `INSPECTION`
   - Adds notes about findings

5. **Create and send quotation**
   - Service advisor creates quotation using `POST /quotations/{orderId}`
   - Sends to customer using `POST /quotations/{orderId}/send`

6. **Customer approves quotation**
   - Service advisor assigns technician using `POST /service-orders/{orderId}/assign-technician`
   - Updates status to `IN_PROGRESS`

7. **Track progress**
   - Customer can track using `GET /service-orders/{orderId}/track`

8. **Service completed**
   - Update status to `COMPLETED`
