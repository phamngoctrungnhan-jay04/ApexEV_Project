# Spare Parts Management Module - Complete Documentation

## Overview

The Spare Parts Management Module provides comprehensive functionality for managing spare parts inventory in the after-sales service system. It handles creation, updates, deletions, inventory tracking, and inventory availability checks for spare parts used in service orders.

## Technology Stack

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: MySQL with JPA/Hibernate
- **Security**: Spring Security + JWT Authentication
- **API Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven
- **Libraries**: 
  - Lombok (boilerplate reduction)
  - ModelMapper (DTO-Entity mapping)
  - Jakarta Bean Validation (input validation)

## Module Architecture

### Entity Structure

**Part.java** (`src/main/java/com/apexev/entity/`)
- Core entity representing a spare part
- Fields: `id`, `partName`, `sku`, `description`, `quantityInStock`, `price`, `status`, `createdAt`, `updatedAt`
- Supports `@Nationalized` for Vietnamese text
- Timestamps managed by Hibernate annotations

### Enums

**PartStatus.java** - Spare part status enumeration
- `ACTIVE`: Part is actively available
- `INACTIVE`: Part is temporarily unavailable
- `DISCONTINUED`: Part is no longer produced
- `OUT_OF_STOCK`: Part is temporarily out of stock

**OrderItemType.java** - Already exists; used with PART type in service orders
**OrderItemStatus.java** - Already exists; represents quotation/approval status

### DTOs (Data Transfer Objects)

#### Request DTOs

**CreatePartRequest**
```java
- partName: String (required, 3-255 chars)
- sku: String (required, unique, 5-100 chars, uppercase with numbers/hyphens)
- description: String (optional)
- quantityInStock: Integer (required, >= 0)
- price: BigDecimal (required, > 0, max 8 digits + 2 decimals)
```

**UpdatePartRequest**
```java
- partName: String (optional, 3-255 chars if provided)
- description: String (optional)
- quantityInStock: Integer (optional, >= 0)
- price: BigDecimal (optional, > 0 if provided)
```

**AdjustInventoryRequest**
```java
- quantityAdjustment: Integer (required, can be negative)
- reason: String (optional, e.g., "DAMAGE", "RESTOCK", "CORRECTION")
- notes: String (optional)
```

**CheckInventoryRequest**
```java
- partId: Long (required)
- requiredQuantity: Integer (required, >= 1)
```

#### Response DTOs

**PartResponse**
```java
- id: Long
- partName: String
- sku: String
- description: String
- quantityInStock: Integer
- price: BigDecimal
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- inStock: boolean (computed: quantityInStock > 0)
```

**InventoryCheckResponse**
```java
- partId: Long
- partName: String
- sku: String
- currentQuantity: Integer
- requiredQuantity: Integer
- available: boolean
- insufficientBy: Integer (null if available, else shortage quantity)
```

## Database Layer

### Repository: PartRepository

**Methods:**
- `findById(Long id)` - Find part by ID (inherited)
- `findBySku(String sku)` - Find by SKU code
- `findByStatus(PartStatus status)` - Find all parts with specific status
- `findLowStockParts(Integer threshold)` - Find parts below quantity threshold
- `findByPartNameContainingIgnoreCase(String partName)` - Search by name
- `findBySkuContainingIgnoreCase(String sku)` - Search by SKU
- `findByStatusOrderByPartNameAsc(PartStatus status)` - Find active parts ordered alphabetically
- `existsSkuExcluding(String sku, Long partId)` - Check SKU uniqueness for updates
- `findOutOfStockParts()` - Find all out-of-stock parts
- `findForInventoryReport()` - Get all parts for reporting

## Service Layer

### Interface: SparePartsService

**CRUD Operations:**
- `createPart(CreatePartRequest)` - Create new part
- `getPartById(Long)` - Retrieve part by ID
- `getPartBySku(String)` - Retrieve part by SKU
- `getAllParts()` - List all parts
- `getActiveParts()` - List only active parts
- `updatePart(Long, UpdatePartRequest)` - Update existing part
- `deletePart(Long)` - Soft delete (mark as DISCONTINUED)
- `changePartStatus(Long, PartStatus)` - Change part status

**Inventory Management:**
- `adjustInventory(Long, AdjustInventoryRequest)` - Adjust stock quantity
- `checkInventory(CheckInventoryRequest)` - Check single part availability
- `checkInventoryBatch(List<CheckInventoryRequest>)` - Check multiple parts
- `getLowStockParts(Integer threshold)` - Get low-stock alerts
- `getOutOfStockParts()` - Get out-of-stock parts

**Search & Reporting:**
- `searchPartsByName(String)` - Search parts by name
- `searchPartsBySku(String)` - Search parts by SKU
- `getInventoryReport()` - Get full inventory report

### Implementation: SparePartsServiceImpl

**Key Features:**
- Full transactional support with `@Transactional`
- Automatic inventory status management (ACTIVE ↔ OUT_OF_STOCK)
- Comprehensive exception handling with custom exceptions
- ModelMapper for efficient DTO mapping
- Read-only operations marked with `@Transactional(readOnly = true)`

**Business Logic:**
1. SKU uniqueness validation on creation and update
2. Inventory prevents negative quantities
3. Automatic status transitions based on stock level
4. Soft deletion by marking as DISCONTINUED
5. Batch inventory checks for efficient multi-part validation

## REST Controller

### Endpoint: /api/spare-parts

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/create` | ADMIN, BUSINESS_MANAGER | Create new part |
| GET | `/{id}` | Authenticated | Get part by ID |
| GET | `/sku/{sku}` | Authenticated | Get part by SKU |
| GET | `/all` | Authenticated | Get all parts |
| GET | `/active` | Authenticated | Get active parts |
| GET | `/inventory/low-stock` | ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR | Get low-stock alerts |
| GET | `/inventory/out-of-stock` | ADMIN, BUSINESS_MANAGER | Get out-of-stock parts |
| GET | `/search/name?query=...` | Authenticated | Search by name |
| GET | `/search/sku?query=...` | Authenticated | Search by SKU |
| GET | `/inventory/report` | ADMIN, BUSINESS_MANAGER | Get inventory report |
| PUT | `/{id}` | ADMIN, BUSINESS_MANAGER | Update part |
| PATCH | `/{id}/status` | ADMIN, BUSINESS_MANAGER | Change status |
| PATCH | `/{id}/inventory/adjust` | ADMIN, BUSINESS_MANAGER, TECHNICIAN | Adjust inventory |
| DELETE | `/{id}` | ADMIN | Soft delete part |
| POST | `/inventory/check` | Authenticated | Check single part availability |
| POST | `/inventory/check-batch` | Authenticated | Check multiple parts availability |

## Security & Authorization

### Role-Based Access Control (RBAC)

- **ADMIN**: Full access to all endpoints
- **BUSINESS_MANAGER**: Create, update, delete parts; manage inventory; generate reports
- **SERVICE_ADVISOR**: View parts; check inventory; access low-stock alerts
- **TECHNICIAN**: View parts; check inventory; adjust inventory
- **CUSTOMER**: No access to this module

## Exception Handling

### Custom Exceptions

**PartNotFoundException**
- Thrown when part with specified ID or SKU not found
- HTTP Status: 404 Not Found

**DuplicatePartException**
- Thrown when creating part with duplicate SKU
- HTTP Status: 409 Conflict

**InsufficientInventoryException**
- Thrown when attempting to use more inventory than available
- HTTP Status: 400 Bad Request

**IllegalArgumentException**
- Thrown when inventory adjustment would result in negative quantity
- HTTP Status: 400 Bad Request

## Integration Points

### With Service Orders
The module integrates with ServiceOrderItem entities:
- When adding a part to a service order (OrderItemType.PART), the part details are referenced
- Inventory availability can be checked before creating order items
- Price is captured at order time to prevent retroactive pricing changes

### With MaintenanceService
- Spare parts and maintenance services are separate line items in service orders
- Both use OrderItemType (PART vs SERVICE) to distinguish in quotations

### With User & Invoice
- Parts are used by TECHNICIAN, SERVICE_ADVISOR roles for service delivery
- Invoices reference parts used in service orders via ServiceOrderItem

## Implementation Patterns

### Creating a Part
```java
POST /api/spare-parts/create
{
  "partName": "Bộ pin xe Vento",
  "sku": "VENTO-BATTERY-001",
  "description": "Pin lithium 48V 100Ah",
  "quantityInStock": 5,
  "price": 15000.00
}
```

### Checking Inventory
```java
POST /api/spare-parts/inventory/check
{
  "partId": 1,
  "requiredQuantity": 3
}

Response:
{
  "partId": 1,
  "partName": "Bộ pin xe Vento",
  "sku": "VENTO-BATTERY-001",
  "currentQuantity": 5,
  "requiredQuantity": 3,
  "available": true,
  "insufficientBy": null
}
```

### Adjusting Inventory
```java
PATCH /api/spare-parts/1/inventory/adjust
{
  "quantityAdjustment": -2,
  "reason": "DAMAGE",
  "notes": "2 units damaged during handling"
}
```

### Batch Inventory Check
```java
POST /api/spare-parts/inventory/check-batch
[
  { "partId": 1, "requiredQuantity": 3 },
  { "partId": 2, "requiredQuantity": 5 },
  { "partId": 3, "requiredQuantity": 2 }
]
```

## Database Schema

```sql
CREATE TABLE parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name NVARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description LONGTEXT,
    quantity_in_stock INT,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

### Manual Testing with Swagger UI
Access: `http://localhost:8080/swagger-ui.html`

### Test Scenarios
1. Create part with duplicate SKU → DuplicatePartException
2. Check inventory with insufficient stock → available=false
3. Adjust inventory to negative → IllegalArgumentException
4. Batch check multiple parts with mixed availability
5. Search parts by partial name and SKU
6. Get low-stock parts below threshold
7. Soft delete part (status changes to DISCONTINUED)

## Next Steps

### Recommended Enhancements
1. **Inventory Audit Trail**: Track inventory adjustments with user/timestamp
2. **Reorder Point**: Configure automatic alerts when stock falls below threshold
3. **Supplier Integration**: Link parts to suppliers for automatic ordering
4. **Barcode Scanning**: Support QR/barcode scanning for part lookup
5. **Bulk Import**: Excel/CSV upload for bulk part creation/updates
6. **Part Compatibility Matrix**: Track which parts work with which vehicle models
7. **Serial Number Tracking**: Track serialized high-value parts
8. **Warranty Management**: Track warranty expiration for parts

## File Locations Reference

```
src/main/java/com/apexev/
├── entity/
│   └── Part.java (UPDATED)
├── enums/
│   ├── PartStatus.java (NEW)
│   ├── OrderItemType.java (existing, uses PART type)
│   └── OrderItemStatus.java (existing)
├── dto/
│   ├── request/coreBussinessRequest/
│   │   ├── CreatePartRequest.java (NEW)
│   │   ├── UpdatePartRequest.java (NEW)
│   │   ├── AdjustInventoryRequest.java (NEW)
│   │   └── CheckInventoryRequest.java (NEW)
│   └── response/coreBussinessResponse/
│       ├── PartResponse.java (NEW)
│       └── InventoryCheckResponse.java (NEW)
├── repository/coreBussiness/
│   └── PartRepository.java (UPDATED)
├── service/
│   ├── service_Interface/
│   │   └── SparePartsService.java (NEW)
│   └── serviceImpl/
│       └── SparePartsServiceImpl.java (NEW)
├── controller/coreBussinessController/
│   └── SparePartsController.java (NEW)
├── exception/
│   ├── PartNotFoundException.java (NEW)
│   ├── InsufficientInventoryException.java (NEW)
│   └── DuplicatePartException.java (NEW)
└── resources/
    └── data-seed.sql (should include sample parts)
```

## Maintenance Notes

### Best Practices
- Always validate SKU uniqueness before creating/updating parts
- Use batch operations for checking multiple parts' inventory
- Implement proper error logging for exception handling
- Cache frequently accessed parts to reduce database queries
- Monitor low-stock alerts to maintain adequate inventory
- Regular inventory audits to verify database counts

### Performance Considerations
- Batch inventory checks reduce API calls from clients
- Search operations use LIKE queries; consider indexing for large datasets
- Read-only transactions for search/reporting operations
- ModelMapper caches mapping between DTO and Entity
