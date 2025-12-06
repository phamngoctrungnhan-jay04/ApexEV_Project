# Spare Parts Management Module - Quick Start Guide

## 🚀 Getting Started

The Spare Parts Management Module is fully implemented and ready to use. This guide helps you quickly understand and work with the module.

## 📋 Module Overview

**What It Does:**
- Manages spare parts inventory for after-sales service
- Tracks availability and stock levels
- Provides CRUD operations for parts management
- Handles inventory adjustments and low-stock alerts
- Enables batch inventory checking

**Key Users:**
- ADMIN: Full control
- BUSINESS_MANAGER: Create/update/manage inventory
- SERVICE_ADVISOR: View parts, check availability
- TECHNICIAN: Adjust inventory during service delivery

## 📁 File Structure

```
Core Module Files:
├── Entity: Part.java (src/main/java/com/apexev/entity/)
├── Repository: PartRepository.java (src/main/java/com/apexev/repository/coreBussiness/)
├── Service: SparePartsService.java + SparePartsServiceImpl.java
├── Controller: SparePartsController.java
├── DTOs: 6 files (CreatePartRequest, UpdatePartRequest, etc.)
├── Enums: PartStatus.java
└── Exceptions: 3 custom exception classes

Documentation:
├── SPARE_PARTS_MODULE.md (comprehensive API documentation)
├── SPARE_PARTS_IMPLEMENTATION_SUMMARY.md (implementation details)
└── .github/copilot-instructions.md (AI agent guidance)
```

## 🎯 Common Tasks

### 1. Create a New Spare Part

**Endpoint:** `POST /api/spare-parts/create`

**Required Role:** ADMIN, BUSINESS_MANAGER

**Example Request:**
```json
{
  "partName": "Bộ pin xe Vento",
  "sku": "VENTO-BATTERY-001",
  "description": "Pin lithium 48V 100Ah cho xe Vento",
  "quantityInStock": 5,
  "price": 15000.00
}
```

**Example Response:**
```json
{
  "id": 1,
  "partName": "Bộ pin xe Vento",
  "sku": "VENTO-BATTERY-001",
  "description": "Pin lithium 48V 100Ah cho xe Vento",
  "quantityInStock": 5,
  "price": 15000.00,
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:30:00",
  "updatedAt": "2025-12-01T10:30:00",
  "inStock": true
}
```

### 2. Check If Inventory Is Available

**Endpoint:** `POST /api/spare-parts/inventory/check`

**Required Role:** Authenticated

**Example Request:**
```json
{
  "partId": 1,
  "requiredQuantity": 3
}
```

**Example Response:**
```json
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

### 3. Adjust Inventory

**Endpoint:** `PATCH /api/spare-parts/{id}/inventory/adjust`

**Required Role:** ADMIN, BUSINESS_MANAGER, TECHNICIAN

**Example - Reduce Stock (Used in Service):**
```json
{
  "quantityAdjustment": -2,
  "reason": "SERVICE_USED",
  "notes": "Used in service order #SO-12345"
}
```

**Example - Add Stock (Restock):**
```json
{
  "quantityAdjustment": 10,
  "reason": "RESTOCK",
  "notes": "Received from supplier ABC on 2025-12-01"
}
```

### 4. Search for Parts

**By Name:**
```
GET /api/spare-parts/search/name?query=pin
```

**By SKU:**
```
GET /api/spare-parts/search/sku?query=VENTO
```

### 5. Get Low-Stock Alerts

**Endpoint:** `GET /api/spare-parts/inventory/low-stock?threshold=10`

**Required Role:** ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR

Returns all parts with quantity below the threshold.

### 6. Update Part Information

**Endpoint:** `PUT /api/spare-parts/{id}`

**Required Role:** ADMIN, BUSINESS_MANAGER

**Example Request:**
```json
{
  "partName": "Bộ pin xe Vento (Updated)",
  "description": "Pin lithium 48V 100Ah (New batch)",
  "price": 14500.00
}
```

All fields are optional - only include what you want to update.

### 7. Delete a Part

**Endpoint:** `DELETE /api/spare-parts/{id}`

**Required Role:** ADMIN

⚠️ **Note:** This performs a soft delete by marking the part as DISCONTINUED. Data is never physically removed.

## 🔍 API Reference

### Base URL
```
/api/spare-parts
```

### Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/create` | ADMIN, BUSINESS_MANAGER | Create part |
| GET | `/{id}` | Authenticated | Get part details |
| GET | `/sku/{sku}` | Authenticated | Get by SKU |
| GET | `/all` | Authenticated | List all parts |
| GET | `/active` | Authenticated | List active parts |
| GET | `/search/name?query=...` | Authenticated | Search by name |
| GET | `/search/sku?query=...` | Authenticated | Search by SKU |
| GET | `/inventory/low-stock?threshold=10` | ADMIN, BM, SA | Low-stock alert |
| GET | `/inventory/out-of-stock` | ADMIN, BM | Out-of-stock parts |
| GET | `/inventory/report` | ADMIN, BM | Full inventory |
| PUT | `/{id}` | ADMIN, BM | Update part |
| PATCH | `/{id}/status` | ADMIN, BM | Change status |
| PATCH | `/{id}/inventory/adjust` | ADMIN, BM, TECH | Adjust stock |
| DELETE | `/{id}` | ADMIN | Delete part |
| POST | `/inventory/check` | Authenticated | Check availability |
| POST | `/inventory/check-batch` | Authenticated | Check multiple |

**Role Abbreviations:** BM = BUSINESS_MANAGER, SA = SERVICE_ADVISOR, TECH = TECHNICIAN

## 🧪 Testing with Swagger UI

1. Navigate to: `http://localhost:8080/swagger-ui.html`
2. Authorize with a JWT token (use your login credentials first to get a token)
3. Expand "spare-parts" section
4. Test each endpoint with the UI

## ⚡ Key Features

### ✅ Automatic Status Management
- When stock reaches 0 → status changes to OUT_OF_STOCK
- When stock increases from 0 → status changes back to ACTIVE

### ✅ SKU Uniqueness
- SKU must be unique per part
- Pattern: uppercase letters, numbers, and hyphens only
- Example: `VENTO-BATTERY-001`, `MP-MOTOR-A1`

### ✅ Soft Deletion
- Deleted parts marked as DISCONTINUED
- Data preserved for audit trail and reporting
- Can be reactivated if needed

### ✅ Batch Operations
- Check availability for multiple parts in one API call
- Reduces API round-trips and improves performance

### ✅ Flexible Search
- Partial matching (e.g., "pin" finds "Bộ pin xe Vento")
- Case-insensitive searches
- Works with both name and SKU

## ⚠️ Important Notes

### Inventory Constraints
- Quantity cannot be negative (adjustment will fail)
- Minimum price is 0.01
- Maximum price digits: 8 integer + 2 decimal places

### Authorization
- All endpoints require JWT authentication (except public auth endpoints)
- Role-based access control is enforced
- Unauthorized requests return 403 Forbidden

### Validation
- SKU format: `^[A-Z0-9-]+$` (uppercase only)
- Part name: 3-255 characters
- All required fields must be provided on creation
- Price must be positive

## 🐛 Common Issues & Solutions

### Issue: "SKU already exists"
**Solution:** Use a unique SKU code. Existing SKUs cannot be reused.

### Issue: "Quantity would become negative"
**Solution:** Cannot adjust inventory below zero. Check current stock first.

### Issue: "Access denied"
**Solution:** You don't have the required role. Check with ADMIN/BUSINESS_MANAGER.

### Issue: "Part not found"
**Solution:** Verify the part ID/SKU exists and hasn't been deleted (DISCONTINUED).

## 🔄 Integration with Service Orders

When creating a service order item:
1. Check part availability: `POST /inventory/check`
2. If available, add to order with type = PART
3. Reduce inventory: `PATCH /{id}/inventory/adjust` (negative quantity)
4. Update service order total price

## 📚 Documentation

For detailed information, see:
- **SPARE_PARTS_MODULE.md** - Complete API documentation
- **SPARE_PARTS_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **.github/copilot-instructions.md** - Development guidelines

## 💡 Best Practices

1. **Always check inventory before using parts:** Use `/inventory/check` endpoint
2. **Use descriptive SKU codes:** Makes searching easier
3. **Monitor low-stock alerts:** Set threshold based on usage patterns
4. **Document inventory adjustments:** Use the `notes` field for tracking
5. **Batch checks when possible:** More efficient than individual checks
6. **Use partial searches:** Faster than remembering exact names/SKUs

## 🎓 For AI Agents

When implementing features related to spare parts:
- Follow the Service Implementation Pattern (Interface → Implementation)
- Use ModelMapper for DTO conversions
- Mark transactional methods with @Transactional
- Use custom exceptions for domain-specific errors
- Validate input with Jakarta Bean Validation
- Check the SparePartsServiceImpl for reference implementation

See `.github/copilot-instructions.md` for complete AI agent guidance.

---

**Status:** ✅ **Module Complete and Ready**

All features implemented, tested, and documented. Start using the spare parts management system right away!
