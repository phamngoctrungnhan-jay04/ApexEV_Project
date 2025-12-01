# ApexEV Copilot Instructions

## Project Overview
ApexEV is a Spring Boot 3.5.6 (Java 17) REST API for an electric vehicle service management system. It manages appointments, service orders, quotations, HR/performance reviews, finances, customer interactions, and spare parts inventory with JWT authentication and role-based access control.

## Architecture

### Layered Structure
- **Controllers** (`src/main/java/com/apexev/controller/`): REST endpoints organized by domain (coreBussinessController, userAndVehicleController)
- **Service Layer** (`src/main/java/com/apexev/service/`): Business logic interfaces in `service_Interface/`, implementations in `serviceImpl/`
- **Repository Layer** (`src/main/java/com/apexev/repository/`): Domain-organized JPA repositories (coreBussiness, hr, maintenance, financeAndReviews, supportAndSystem, userAndVehicle)
- **DTOs** (`src/main/java/com/apexev/dto/`): Request and response objects with Jakarta Bean Validation
- **Entities** (`src/main/java/com/apexev/entity/`): JPA entities with `@Entity`, `@Nationalized` (for Vietnamese text), and Lombok annotations

### Domain Modules
Repository folders mirror business domains—each contains related entities and repositories:
- **coreBussiness**: Appointments, ServiceOrder, ServiceOrderItem, MaintenanceService, Part
- **userAndVehicle**: User, Vehicle, UserRole
- **hr**: PerformanceReview, KPI, LeaveRequest
- **financeAndReviews**: Invoice, Review
- **maintenance**: ServiceChecklist
- **supportAndSystem**: ChatConversation, ChatMessage

## Key Patterns

### Service Implementation Pattern
All services use the Interface + Implementation pattern:
1. Define interface in `service_Interface/` (e.g., `SparePartsService`)
2. Implement in `serviceImpl/` with `@Service` + `@RequiredArgsConstructor` (Lombok)
3. Mark transactional methods with `@Transactional`
4. Use constructor injection with Lombok `@RequiredArgsConstructor`, NOT `@Autowired`

**Example**:
```java
@Service
@RequiredArgsConstructor
@Transactional
public class SparePartsServiceImpl implements SparePartsService {
    private final PartRepository partRepository;
    private final ModelMapper modelMapper;
    
    @Override
    public PartResponse createPart(CreatePartRequest request) {
        if (partRepository.findBySku(request.getSku()).isPresent()) {
            throw new DuplicatePartException("SKU already exists");
        }
        Part part = new Part();
        // ... populate fields ...
        return mapToResponse(partRepository.save(part));
    }
}
```

### DTO Mapping with ModelMapper
- Project uses `ModelMapper` (v3.1.0) for Entity ↔ DTO conversions
- Avoid returning raw entities in API responses
- Create utility mappers or use ModelMapper bean from Spring context
- In Spare Parts module: `mapToResponse()` converts Part entity to PartResponse

### Repository Query Methods
- Extend `JpaRepository<Entity, IdType>`
- Use method naming conventions for queries: `findByXxxId()`, `findByXxxOrderByYyy()`
- Complex queries should use `@Query` annotations
- Examples: `findByServiceOrderId()`, `findByStatusOrderByPartNameAsc()`, `findLowStockParts(Integer threshold)`

### Exception Handling
- Use custom exceptions (e.g., `ResourceNotFoundException`, `PartNotFoundException`) for domain-specific errors
- Throw with descriptive messages including context
- Controllers should handle and map to appropriate HTTP status codes
- Pattern in Spare Parts module: `PartNotFoundException`, `DuplicatePartException`, `InsufficientInventoryException`

### Validation & Input Handling
- All DTOs use Jakarta Bean Validation annotations (`@NotNull`, `@NotBlank`, `@Pattern`, `@Digits`, etc.)
- Never skip input validation or null checks
- Custom validators can be added to DTOs
- Example from Spare Parts: SKU validation with `@Pattern(regexp = "^[A-Z0-9-]+$")`

## Security & Authentication

### JWT Flow
- Spring Security + JWT (JJWT v0.12.6)
- `JwtAuthenticationFilter` validates tokens on every request
- Stateless session management (STATELESS session creation policy)
- CORS enabled and configured globally

### Authorization
Key roles: `SERVICE_ADVISOR`, `ADMIN`, `BUSINESS_MANAGER`, `TECHNICIAN`, `CUSTOMER`
- Use `@PreAuthorize` on controller methods for role checks
- User context available via SecurityContextHolder in services
- Spare Parts module examples:
  - `@PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")` for create/update
  - `@PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER', 'TECHNICIAN')")` for inventory adjust
  - `@PreAuthorize("isAuthenticated()")` for read operations

### Endpoints
- Public: `/api/auth/**`, `/api/chat/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- Protected: All others require JWT token and appropriate role

## Build & Test

### Maven Build
```bash
mvn clean install              # Full build
mvn spring-boot:run           # Run application (dev)
mvn test                       # Run tests
```

### Testing Endpoints
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Swagger API docs: `http://localhost:8080/v3/api-docs`
- Test via Postman or curl with JWT token in `Authorization: Bearer <token>` header

### Database
- MySQL with JPA/Hibernate
- Entities use `@Nationalized` for Vietnamese character support
- See `data-seed.sql` for initial data

## Spare Parts Management Module

### Overview
The Spare Parts Management Module provides CRUD operations, inventory tracking, and availability checks for spare parts used in service orders.

### Key Components
- **Entity**: `Part.java` - Extended with `status`, `createdAt`, `updatedAt` fields
- **Enums**: `PartStatus` (ACTIVE, INACTIVE, DISCONTINUED, OUT_OF_STOCK)
- **DTOs**: CreatePartRequest, UpdatePartRequest, AdjustInventoryRequest, CheckInventoryRequest
- **Response**: PartResponse, InventoryCheckResponse
- **Repository**: PartRepository with 8+ custom query methods
- **Service**: SparePartsService interface + SparePartsServiceImpl
- **Controller**: SparePartsController with 16+ endpoints

### Spare Parts Patterns

#### Creating Parts
```java
@PostMapping("/create")
@PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")
public ResponseEntity<PartResponse> createPart(@Valid @RequestBody CreatePartRequest request) {
    // Validation includes SKU uniqueness, pattern matching, decimal precision
}
```

#### Inventory Management
- **Adjust Inventory**: Supports positive/negative adjustments with auto-status updates
- **Check Availability**: Single part or batch operations
- **Low-Stock Alerts**: Query parts below threshold
- **Out-of-Stock Tracking**: Automatic status transitions (ACTIVE ↔ OUT_OF_STOCK)

#### Search Operations
- By SKU: `GET /api/spare-parts/search/sku?query=...`
- By Name: `GET /api/spare-parts/search/name?query=...`
- Case-insensitive, partial matching

#### Soft Deletion
- `DELETE /api/spare-parts/{id}` marks part as DISCONTINUED
- Never physically removes data for audit trail

### Database Fields (Part Entity)
- `id`: Long, Primary Key
- `partName`: String, @Nationalized (Vietnamese support)
- `sku`: String, Unique, uppercase pattern
- `description`: String, @Nationalized
- `quantityInStock`: Integer
- `price`: BigDecimal (10,2)
- `status`: Enum, default ACTIVE
- `createdAt`: LocalDateTime, @CreationTimestamp
- `updatedAt`: LocalDateTime, @UpdateTimestamp

## Common Implementation Tasks

### Adding a New Service Endpoint
1. Create Request DTO in `dto/request/coreBussinessRequest/` with validation
2. Create Response DTO in `dto/response/coreBussinessResponse/` (always use DTOs, never raw entities)
3. Add method to service interface in `service_Interface/`
4. Implement in `serviceImpl/` with proper transactions
5. Add controller method with `@PreAuthorize` role check
6. Ensure method throws appropriate custom exceptions for missing resources
7. Map entity to DTO before returning

### Adding a New Repository Query
1. Define method signature in repository interface (extends JpaRepository)
2. Use naming conventions or `@Query` for complex queries
3. Return `Optional<T>` for single results, `List<T>` for collections
4. Call from service layer using helper methods (findXxxOrThrow pattern)
5. Example: `List<Part> findLowStockParts(@Param("threshold") Integer threshold)`

### Handling Transactions
- Mark multi-step operations with `@Transactional`
- Place on service implementation class or individual methods
- Automatic rollback on unchecked exceptions
- Nested transactions use default REQUIRED propagation
- Read-only operations: `@Transactional(readOnly = true)` for performance

## Technologies & Dependencies

### Core Stack
- Spring Boot 3.5.6, Spring Data JPA, Spring Security
- Java 17
- MySQL with Hibernate
- Lombok (annotation processing for boilerplate reduction)

### Key Libraries
- **JWT**: JJWT (v0.12.6) with Jackson support
- **Mapping**: ModelMapper (v3.1.0)
- **Email**: Jakarta Mail (spring-boot-starter-mail)
- **Excel**: Apache POI (v5.2.5)
- **API Docs**: Springdoc OpenAPI (Swagger integration)
- **DevTools**: Spring Boot DevTools for live reload

### Application Properties
- Configure database connection, JWT secret, email settings in `application.properties`
- Mail service configured for sending quotations and notifications

## File Organization Quick Reference

```
src/main/java/com/apexev/
├── config/              # Security, JWT, OpenAPI configs
├── controller/          # REST endpoints (organized by domain)
│   └── coreBussinessController/
│       └── SparePartsController.java (NEW)
├── service/
│   ├── service_Interface/
│   │   └── SparePartsService.java (NEW)
│   └── serviceImpl/
│       └── SparePartsServiceImpl.java (NEW)
├── repository/          # Data access (organized by domain)
│   └── coreBussiness/
│       └── PartRepository.java (UPDATED)
├── entity/
│   ├── Part.java (UPDATED - added status, timestamps)
│   ├── ServiceOrder.java
│   └── ...
├── dto/
│   ├── request/coreBussinessRequest/
│   │   ├── CreatePartRequest.java (NEW)
│   │   ├── UpdatePartRequest.java (NEW)
│   │   ├── AdjustInventoryRequest.java (NEW)
│   │   └── CheckInventoryRequest.java (NEW)
│   └── response/coreBussinessResponse/
│       ├── PartResponse.java (NEW)
│       └── InventoryCheckResponse.java (NEW)
├── enums/
│   ├── PartStatus.java (NEW)
│   ├── OrderItemType.java
│   └── ...
├── exception/
│   ├── PartNotFoundException.java (NEW)
│   ├── InsufficientInventoryException.java (NEW)
│   ├── DuplicatePartException.java (NEW)
│   └── ...
└── resources/
    └── application.properties
```

## When Working with AI Agents

### Reference Existing Implementations
- Check `SparePartsServiceImpl` for inventory management patterns
- Review `ServiceAdvisorServiceImpl` for complex service patterns
- Study controller patterns in `SparePartsController`

### Ask Clarifying Questions
- **What role should have access?** (impacts @PreAuthorize)
- **Is this a read-only or mutating operation?** (impacts @Transactional)
- **What entities need to be loaded?** (impacts repository queries)
- **How should errors be handled?** (custom exception vs generic)
- **Is batch processing needed?** (impacts performance considerations)

### Avoid These Mistakes
- ❌ Returning raw entities in API responses
- ❌ Using `@Autowired` instead of Lombok injection
- ❌ Skipping input validation
- ❌ Not using @Transactional for multi-step operations
- ❌ Hardcoding business logic without service layer
- ❌ Mixed repository organization (keep by domain)
- ❌ Ignoring SKU uniqueness in part creation
- ❌ Allowing negative inventory quantities
- ❌ Hard deleting parts instead of soft delete with status
- ❌ Forgetting to check inventory before creating service order items

## Documentation References

- **Service Advisor Module**: `SERVICE_ADVISOR_MODULE.md`
- **Spare Parts Module**: `SPARE_PARTS_MODULE.md` (NEW)
- **API Overview**: `BUSINESS_MANAGER_API.md`
- **Help & Setup**: `HELP.md`
