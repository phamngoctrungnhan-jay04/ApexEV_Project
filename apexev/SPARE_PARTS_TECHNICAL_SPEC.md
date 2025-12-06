# Spare Parts Management Module - Complete Technical Specification

## 1. Executive Overview

The Spare Parts Management Module is a comprehensive inventory management system for after-sales service operations. It provides real-time inventory tracking, automated stock deduction, and complete traceability of spare parts usage across service orders.

### Key Objectives
- Maintain accurate real-time inventory levels
- Prevent stock-outs with low-stock alerts
- Enable automatic inventory deduction on service completion
- Provide complete audit trail of all inventory movements
- Support multiple suppliers and cost tracking

---

## 2. Data Model & Database Schema

### 2.1 Core Entities

#### Part Entity (Enhanced)
```sql
CREATE TABLE parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique part code (e.g., MP-VENTO-BATT-001)',
    part_name NVARCHAR(255) NOT NULL COMMENT 'Vietnamese localized part name',
    category_id BIGINT COMMENT 'Reference to part category',
    unit_id BIGINT COMMENT 'Reference to unit of measurement',
    description LONGTEXT COMMENT 'Detailed part description',
    current_stock INT NOT NULL DEFAULT 0 COMMENT 'Current quantity in warehouse',
    minimum_stock_level INT NOT NULL DEFAULT 10 COMMENT 'Low-stock alert threshold',
    reorder_quantity INT COMMENT 'Recommended reorder quantity',
    price DECIMAL(10, 2) NOT NULL COMMENT 'Unit cost price',
    supplier_id BIGINT COMMENT 'Primary supplier reference',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, DISCONTINUED, OUT_OF_STOCK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT 'User who created this part',
    updated_by BIGINT COMMENT 'User who last updated this part',
    
    FOREIGN KEY (category_id) REFERENCES part_categories(category_id),
    FOREIGN KEY (unit_id) REFERENCES units(unit_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (updated_by) REFERENCES users(user_id),
    
    INDEX idx_part_code (part_code),
    INDEX idx_status (status),
    INDEX idx_current_stock (current_stock),
    INDEX idx_category (category_id)
);
```

#### Part Category Entity
```sql
CREATE TABLE part_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (category_name)
);

-- Sample Data
INSERT INTO part_categories (category_name, description) VALUES
('Battery', 'Replacement batteries for electric vehicles'),
('Motor Components', 'Electric motor parts and components'),
('Cooling System', 'Radiators, fans, and cooling components'),
('Electrical Components', 'Wiring, connectors, switches'),
('Suspension', 'Shock absorbers, springs, struts'),
('Brake System', 'Brake pads, rotors, calipers');
```

#### Unit Entity
```sql
CREATE TABLE units (
    unit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL UNIQUE,
    unit_abbreviation VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_abbreviation (unit_abbreviation)
);

-- Sample Data
INSERT INTO units (unit_name, unit_abbreviation) VALUES
('Piece', 'pc'),
('Kilogram', 'kg'),
('Meter', 'm'),
('Liter', 'l'),
('Box', 'box'),
('Set', 'set');
```

#### Supplier Entity
```sql
CREATE TABLE suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_name NVARCHAR(255) NOT NULL,
    contact_person NVARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address LONGTEXT,
    city NVARCHAR(100),
    country NVARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    payment_terms VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_status (status)
);
```

#### Inventory History Entity
```sql
CREATE TABLE inventory_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL COMMENT 'PURCHASE, USAGE, ADJUSTMENT, DAMAGE, RETURN',
    quantity_change INT NOT NULL COMMENT 'Can be positive or negative',
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reference_id BIGINT COMMENT 'References service_order_item or purchase_order',
    reference_type VARCHAR(50) COMMENT 'SERVICE_ORDER_ITEM, PURCHASE_ORDER, MANUAL_ADJUSTMENT',
    reason NVARCHAR(255) COMMENT 'Reason for transaction',
    notes LONGTEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_id, reference_type)
);
```

#### Part Supplier Mapping Entity
```sql
CREATE TABLE part_suppliers (
    part_supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    supplier_part_code VARCHAR(100) COMMENT 'Part code assigned by supplier',
    supplier_price DECIMAL(10, 2),
    lead_time_days INT COMMENT 'Days to receive order',
    minimum_order_quantity INT,
    is_preferred BOOLEAN DEFAULT FALSE COMMENT 'Preferred supplier for this part',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    UNIQUE KEY uk_part_supplier (part_id, supplier_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_supplier_id (supplier_id)
);
```

#### Stock Alert Entity
```sql
CREATE TABLE stock_alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    alert_type VARCHAR(50) NOT NULL COMMENT 'LOW_STOCK, OUT_OF_STOCK, OVERSTOCK',
    current_stock INT,
    threshold_value INT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(user_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_is_acknowledged (is_acknowledged),
    INDEX idx_created_at (created_at)
);
```

### 2.2 Integration with Existing Entities

#### ServiceOrderItem Enhancement
```sql
-- Add new columns to existing service_order_items table
ALTER TABLE service_order_items ADD COLUMN part_id BIGINT COMMENT 'Reference to Part entity' AFTER item_ref_id;
ALTER TABLE service_order_items ADD COLUMN supplier_id BIGINT COMMENT 'Supplier used for this part' AFTER part_id;
ALTER TABLE service_order_items ADD COLUMN is_used BOOLEAN DEFAULT FALSE COMMENT 'Whether part was actually used';
ALTER TABLE service_order_items ADD COLUMN used_at TIMESTAMP NULL COMMENT 'When part was deducted from inventory';
ALTER TABLE service_order_items ADD FOREIGN KEY (part_id) REFERENCES parts(part_id);
ALTER TABLE service_order_items ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id);
ALTER TABLE service_order_items ADD INDEX idx_part_id (part_id);
ALTER TABLE service_order_items ADD INDEX idx_is_used (is_used);
```

---

## 3. API Endpoints Specification

### 3.1 Part Management Endpoints

#### Create Part
```
POST /api/spare-parts/create
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER

Request Body:
{
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V",
  "categoryId": 1,
  "unitId": 1,
  "description": "Pin lithium 48V 100Ah",
  "minimumStockLevel": 5,
  "reorderQuantity": 20,
  "price": 15000.00,
  "supplierId": 1
}

Response (201 Created):
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V",
  "category": {"id": 1, "name": "Battery"},
  "unit": {"id": 1, "name": "Piece", "abbreviation": "pc"},
  "currentStock": 0,
  "minimumStockLevel": 5,
  "reorderQuantity": 20,
  "price": 15000.00,
  "supplier": {"id": 1, "name": "Supplier ABC"},
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:30:00",
  "createdBy": {"id": 1, "name": "Admin User"}
}

Error Responses:
- 400: Invalid input (duplicate part code, invalid category, etc.)
- 409: Part code already exists
- 403: Insufficient permissions
```

#### Get Part Details
```
GET /api/spare-parts/{partId}
Authorization: Bearer {JWT_TOKEN}
Roles: Authenticated

Response (200 OK):
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V",
  "category": {"id": 1, "name": "Battery"},
  "unit": {"id": 1, "name": "Piece", "abbreviation": "pc"},
  "currentStock": 5,
  "minimumStockLevel": 5,
  "reorderQuantity": 20,
  "price": 15000.00,
  "supplier": {...},
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:30:00",
  "updatedAt": "2025-12-01T11:00:00",
  "inStock": true,
  "needsReorder": false,
  "recentUsage": [
    {
      "date": "2025-12-01T09:00:00",
      "quantity": 2,
      "serviceOrder": "SO-2025-1001",
      "technician": "John Doe"
    }
  ],
  "inventoryHistory": [
    {
      "date": "2025-12-01T09:00:00",
      "type": "USAGE",
      "quantity": -2,
      "before": 7,
      "after": 5,
      "reason": "Used in service order SO-2025-1001"
    }
  ]
}

Error Responses:
- 404: Part not found
```

#### Update Part Information
```
PUT /api/spare-parts/{partId}
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER

Request Body (all fields optional):
{
  "partName": "Bộ pin xe Vento 48V (Updated)",
  "categoryId": 1,
  "minimumStockLevel": 8,
  "reorderQuantity": 25,
  "price": 14500.00,
  "supplierId": 2
}

Response (200 OK):
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V (Updated)",
  "minimumStockLevel": 8,
  "reorderQuantity": 25,
  "price": 14500.00,
  "updatedAt": "2025-12-01T12:00:00",
  "updatedBy": {"id": 1, "name": "Admin User"}
}

Error Responses:
- 400: Invalid input
- 404: Part not found
- 409: Duplicate part code in update
```

#### Delete/Deactivate Part
```
DELETE /api/spare-parts/{partId}
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN

Response (204 No Content):
{
  "status": "Part marked as DISCONTINUED"
}

Error Responses:
- 404: Part not found
- 409: Cannot delete part with active usage in pending orders
```

#### List All Parts (with pagination & filtering)
```
GET /api/spare-parts?page=0&size=20&category=1&status=ACTIVE&search=battery
Authorization: Bearer {JWT_TOKEN}
Roles: Authenticated

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "partCode": "MP-VENTO-BATT-001",
      "partName": "Bộ pin xe Vento 48V",
      "category": "Battery",
      "currentStock": 5,
      "minimumStockLevel": 5,
      "price": 15000.00,
      "status": "ACTIVE",
      "inStock": true
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0,
  "pageSize": 20
}
```

### 3.2 Inventory Management Endpoints

#### Check Stock Availability (Single Part)
```
POST /api/spare-parts/inventory/check
Authorization: Bearer {JWT_TOKEN}
Roles: Authenticated

Request Body:
{
  "partId": 1,
  "requiredQuantity": 3
}

Response (200 OK):
{
  "partId": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V",
  "currentStock": 5,
  "requiredQuantity": 3,
  "available": true,
  "insufficientBy": null,
  "willNeedReorder": false,
  "recommendations": [
    {
      "action": "Can proceed with service",
      "message": "Sufficient stock available"
    }
  ]
}

Response (200 OK - Insufficient Stock):
{
  "partId": 2,
  "partCode": "MP-MOTOR-A1",
  "partName": "Motor Controller",
  "currentStock": 1,
  "requiredQuantity": 3,
  "available": false,
  "insufficientBy": 2,
  "willNeedReorder": true,
  "recommendations": [
    {
      "action": "WARN",
      "message": "Insufficient stock. Need 2 more units.",
      "alternativeSuppliers": [
        {"id": 2, "name": "Supplier XYZ", "leadTime": "2 days"}
      ]
    },
    {
      "action": "WAIT_OR_SUBSTITUTE",
      "message": "Can substitute with compatible part MP-MOTOR-A2 (5 in stock)"
    }
  ]
}
```

#### Check Batch Stock Availability
```
POST /api/spare-parts/inventory/check-batch
Authorization: Bearer {JWT_TOKEN}
Roles: Authenticated

Request Body:
{
  "items": [
    {"partId": 1, "requiredQuantity": 3},
    {"partId": 2, "requiredQuantity": 5},
    {"partId": 3, "requiredQuantity": 2}
  ]
}

Response (200 OK):
{
  "checkResults": [
    {
      "partId": 1,
      "partCode": "MP-VENTO-BATT-001",
      "available": true,
      "insufficientBy": null
    },
    {
      "partId": 2,
      "partCode": "MP-MOTOR-A1",
      "available": false,
      "insufficientBy": 2
    },
    {
      "partId": 3,
      "partCode": "MP-SENSOR-01",
      "available": true,
      "insufficientBy": null
    }
  ],
  "allAvailable": false,
  "overallStatus": "PARTIAL_AVAILABILITY",
  "canProceedWithPartialStockage": true
}
```

#### Adjust Stock Manually
```
PATCH /api/spare-parts/{partId}/inventory/adjust
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER

Request Body:
{
  "quantityAdjustment": -2,
  "reason": "DAMAGE",
  "notes": "2 units damaged during storage",
  "documentReference": "DAM-2025-001"
}

Response (200 OK):
{
  "partId": 1,
  "partCode": "MP-VENTO-BATT-001",
  "quantityBefore": 7,
  "quantityAfter": 5,
  "quantityChange": -2,
  "reason": "DAMAGE",
  "notes": "2 units damaged during storage",
  "adjustedAt": "2025-12-01T14:30:00",
  "adjustedBy": {"id": 1, "name": "Manager Name"}
}

Error Responses:
- 400: Adjustment would result in negative inventory
- 404: Part not found
```

#### Auto-Deduct on Service Completion
```
POST /api/spare-parts/usage/apply-to-order
Authorization: Bearer {JWT_TOKEN}
Roles: TECHNICIAN, SERVICE_ADVISOR, ADMIN

Request Body:
{
  "serviceOrderId": 101,
  "items": [
    {
      "serviceOrderItemId": 5001,
      "partId": 1,
      "quantityToDeduct": 2,
      "reason": "Used in service delivery"
    },
    {
      "serviceOrderItemId": 5002,
      "partId": 3,
      "quantityToDeduct": 1,
      "reason": "Used in service delivery"
    }
  ]
}

Response (200 OK):
{
  "serviceOrderId": 101,
  "deductionStatus": "SUCCESS",
  "itemsProcessed": 2,
  "totalCost": 30000.00,
  "inventory_adjustments": [
    {
      "partId": 1,
      "partCode": "MP-VENTO-BATT-001",
      "quantityDeducted": 2,
      "stockAfter": 3,
      "costDeducted": 30000.00,
      "timestamp": "2025-12-01T15:00:00"
    },
    {
      "partId": 3,
      "partCode": "MP-SENSOR-01",
      "quantityDeducted": 1,
      "stockAfter": 4,
      "costDeducted": 5000.00,
      "timestamp": "2025-12-01T15:00:00"
    }
  ],
  "auditLog": "Inventory deducted for service order SO-2025-1001"
}

Error Responses:
- 400: Insufficient stock for one or more items
- 404: Service order or part not found
- 409: Inventory already deducted for this order
```

### 3.3 Low Stock Alert Endpoints

#### Get Low Stock Alerts
```
GET /api/spare-parts/alerts/low-stock?threshold=10
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR

Response (200 OK):
{
  "alerts": [
    {
      "alertId": 1,
      "part": {
        "id": 1,
        "partCode": "MP-VENTO-BATT-001",
        "partName": "Bộ pin xe Vento 48V",
        "currentStock": 3,
        "minimumStockLevel": 5,
        "reorderQuantity": 20
      },
      "alertType": "LOW_STOCK",
      "severity": "HIGH",
      "daysUntilStockout": 5,
      "supplier": {"id": 1, "name": "Supplier ABC"},
      "suggestedOrderQuantity": 20,
      "createdAt": "2025-12-01T08:00:00",
      "isAcknowledged": false
    },
    {
      "alertId": 2,
      "part": {...},
      "alertType": "OUT_OF_STOCK",
      "severity": "CRITICAL",
      "daysUntilStockout": 0,
      "supplier": {...},
      "suggestedOrderQuantity": 20,
      "createdAt": "2025-12-01T10:00:00",
      "isAcknowledged": false
    }
  ],
  "totalAlerts": 2,
  "criticalCount": 1,
  "highCount": 1,
  "mediumCount": 0
}
```

#### Acknowledge Stock Alert
```
PATCH /api/spare-parts/alerts/{alertId}/acknowledge
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER

Response (200 OK):
{
  "alertId": 1,
  "acknowledged": true,
  "acknowledgedBy": {"id": 1, "name": "Manager Name"},
  "acknowledgedAt": "2025-12-01T15:30:00"
}
```

### 3.4 Inventory History & Reporting Endpoints

#### Get Inventory History
```
GET /api/spare-parts/{partId}/history?from=2025-12-01&to=2025-12-07&type=USAGE
Authorization: Bearer {JWT_TOKEN}
Roles: Authenticated

Response (200 OK):
{
  "partId": 1,
  "partCode": "MP-VENTO-BATT-001",
  "history": [
    {
      "historyId": 1,
      "date": "2025-12-01T09:00:00",
      "type": "USAGE",
      "quantity": -2,
      "before": 7,
      "after": 5,
      "reference": {"type": "SERVICE_ORDER", "id": "SO-2025-1001"},
      "reason": "Used in service delivery",
      "recordedBy": "Tech John"
    },
    {
      "historyId": 2,
      "date": "2025-12-02T10:00:00",
      "type": "ADJUSTMENT",
      "quantity": 10,
      "before": 5,
      "after": 15,
      "reference": {"type": "PURCHASE_ORDER", "id": "PO-2025-0501"},
      "reason": "Restock from supplier",
      "recordedBy": "Manager Admin"
    }
  ],
  "summary": {
    "totalUsed": -5,
    "totalReceived": 15,
    "netChange": 10
  }
}
```

#### Get Inventory Report
```
GET /api/spare-parts/reports/inventory-summary?category=1&includeHistorical=true
Authorization: Bearer {JWT_TOKEN}
Roles: ADMIN, BUSINESS_MANAGER

Response (200 OK):
{
  "reportDate": "2025-12-01T16:00:00",
  "generatedBy": "system",
  "summary": {
    "totalParts": 45,
    "totalValue": 1500000.00,
    "partsInStock": 38,
    "partsOutOfStock": 4,
    "partsLowStock": 3
  },
  "byCategory": [
    {
      "category": "Battery",
      "totalParts": 8,
      "totalQuantity": 45,
      "totalValue": 450000.00,
      "averageStockLevel": 5.6,
      "partsNeedingReorder": 2
    }
  ],
  "topMovingParts": [
    {
      "rank": 1,
      "partCode": "MP-VENTO-BATT-001",
      "partName": "Bộ pin xe Vento 48V",
      "usedInLast30Days": 12,
      "currentStock": 3,
      "estimatedDaysOfSupply": 7.5
    }
  ]
}
```

---

## 4. Validation Rules & Error Handling

### 4.1 Input Validation

#### Part Creation Validation
```javascript
{
  "partCode": {
    "required": true,
    "pattern": "^[A-Z0-9-]{5,50}$",
    "unique": true,
    "message": "Part code must be 5-50 chars, uppercase with numbers/hyphens"
  },
  "partName": {
    "required": true,
    "minLength": 3,
    "maxLength": 255,
    "message": "Part name required, 3-255 characters"
  },
  "categoryId": {
    "required": true,
    "type": "number",
    "message": "Valid category must be selected"
  },
  "minimumStockLevel": {
    "required": true,
    "type": "number",
    "min": 0,
    "max": 10000,
    "message": "Minimum stock level must be 0-10000"
  },
  "price": {
    "required": true,
    "type": "decimal",
    "min": 0.01,
    "max": 99999999.99,
    "precision": "10,2",
    "message": "Price must be 0.01-99999999.99"
  }
}
```

#### Stock Adjustment Validation
```javascript
{
  "quantityAdjustment": {
    "required": true,
    "type": "number",
    "validation": "currentStock + adjustment >= 0",
    "message": "Adjustment would result in negative inventory"
  },
  "reason": {
    "required": true,
    "enum": ["DAMAGE", "RESTOCK", "CORRECTION", "RETURN", "USAGE", "LOSS"],
    "message": "Valid reason must be provided"
  }
}
```

### 4.2 Business Rule Validation

#### Inventory Check Rules
```
Rule 1: Insufficient Stock Check
  - IF requiredQuantity > currentStock
  - THEN return {available: false, insufficientBy: X}
  - ACTION: Block operation, display warning

Rule 2: Low Stock Warning
  - IF (currentStock - requiredQuantity) < minimumStockLevel
  - THEN return warning and suggest reorder
  - ACTION: Allow operation but warn user

Rule 3: Out of Stock Protection
  - IF status == OUT_OF_STOCK
  - THEN block all usage operations
  - ACTION: Display error, suggest alternative parts

Rule 4: Duplicate Deduction Prevention
  - IF serviceOrderItem.isUsed == true
  - THEN prevent re-deduction
  - ACTION: Block operation with error message
```

### 4.3 Error Response Codes

```
Success Codes:
  200 OK - Successful GET/PUT/PATCH
  201 Created - Successful POST (resource creation)
  204 No Content - Successful DELETE

Client Error Codes:
  400 Bad Request
    - Invalid input validation
    - Negative inventory result
    - Invalid reason codes
  
  401 Unauthorized
    - Missing JWT token
    - Expired token
  
  403 Forbidden
    - Insufficient role/permissions
  
  404 Not Found
    - Part not found
    - Service order not found
    - Alert not found
  
  409 Conflict
    - Duplicate part code
    - Part already deleted
    - Inventory already deducted

Server Error Codes:
  500 Internal Server Error
    - Unexpected server error
  
  503 Service Unavailable
    - Database connection issues
```

### 4.4 Error Response Format

```json
{
  "timestamp": "2025-12-01T16:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Inventory adjustment would result in negative stock",
  "path": "/api/spare-parts/1/inventory/adjust",
  "details": {
    "field": "quantityAdjustment",
    "rejectedValue": -10,
    "currentStock": 5,
    "reason": "Cannot reduce inventory below 0"
  },
  "suggestions": [
    "Check current stock level before adjustment",
    "Maximum deduction: 5 units",
    "Consider registering as damage if loss occurred"
  ]
}
```

---

## 5. Stock Update on Service Usage - Detailed Workflow

### 5.1 Transaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SERVICE ORDER LIFECYCLE & INVENTORY DEDUCTION               │
└─────────────────────────────────────────────────────────────┘

1. SERVICE ORDER CREATED
   └─ Parts selected as needed for service
   └─ Inventory availability checked
   └─ Quotation prepared (parts not deducted yet)
   └─ Status: PENDING

2. SERVICE IN PROGRESS
   └─ Technician receives parts
   └─ Parts may or may not be used
   └─ Status: IN_PROGRESS

3. SERVICE COMPLETED - INVENTORY DEDUCTION
   ┌─ Technician/Manager confirms parts actually used
   │
   ├─ ENDPOINT: POST /api/spare-parts/usage/apply-to-order
   │
   ├─ SYSTEM VALIDATES:
   │  ├─ Service order exists and is IN_PROGRESS
   │  ├─ Each part exists and is not DISCONTINUED
   │  ├─ Sufficient stock for each part
   │  └─ Part not already deducted (idempotency check)
   │
   ├─ FOR EACH PART:
   │  ├─ Check: currentStock >= quantityToDeduct
   │  │  └─ IF FALSE: Return error, rollback all
   │  │
   │  ├─ Deduct: currentStock -= quantityToDeduct
   │  │
   │  ├─ Auto-Status Update:
   │  │  ├─ IF newStock == 0: status = OUT_OF_STOCK
   │  │  ├─ IF newStock < minimumStock: Create LOW_STOCK alert
   │  │  └─ IF newStock >= minimumStock: Clear LOW_STOCK alert
   │  │
   │  ├─ Create Inventory History:
   │  │  ├─ type: USAGE
   │  │  ├─ reference: SERVICE_ORDER_ITEM
   │  │  ├─ quantity: -X
   │  │  ├─ reason: "Used in service SO-XXXX"
   │  │  └─ timestamp: Now
   │  │
   │  └─ Update ServiceOrderItem:
   │     ├─ isUsed: true
   │     ├─ usedAt: Now
   │     └─ costDeducted: unitPrice * quantity
   │
   ├─ CREATE AUDIT LOG:
   │  ├─ action: "INVENTORY_DEDUCTION"
   │  ├─ user: Current technician/manager
   │  ├─ timestamp: Now
   │  ├─ orderId: SO-XXXX
   │  └─ itemsAffected: N
   │
   ├─ UPDATE SERVICE ORDER:
   │  ├─ totalCostWithParts: Recalculate
   │  └─ inventoryDeductionStatus: COMPLETE
   │
   └─ Status: COMPLETED / DEDUCTED

4. ERROR HANDLING:
   ├─ IF insufficient stock:
   │  ├─ Rollback all changes
   │  ├─ Return error with details
   │  └─ Alert manager for approval (partial deduction?)
   │
   ├─ IF part not found:
   │  ├─ Rollback all changes
   │  └─ Return error
   │
   └─ IF duplicate request:
       └─ Return success (idempotent)
```

### 5.2 State Management

```sql
-- ServiceOrderItem states during service lifecycle
PENDING        → Order created, parts quoted
IN_PROGRESS    → Service started, technician assigned
USED           → Part actually used in service (after deduction)
NOT_USED       → Part quoted but not used
CANCELLED      → Service cancelled, no deduction
COMPLETED      → Service complete, inventory deducted

-- Part states during inventory operations
ACTIVE         → Part available for use
LOW_STOCK      → Stock below minimum threshold
OUT_OF_STOCK   → Stock at zero
DISCONTINUED   → Part no longer available
INACTIVE       → Temporarily unavailable
```

### 5.3 Transaction Isolation

```java
// Pseudo-code for transaction handling
@Transactional(isolation = Isolation.SERIALIZABLE)
public InventoryDeductionResponse deductInventoryForService(
    Long serviceOrderId,
    List<InventoryDeductionRequest> items
) {
    // Start transaction with SERIALIZABLE isolation
    // to prevent concurrent modifications
    
    try {
        // 1. Validate service order
        ServiceOrder order = validate(serviceOrderId);
        
        // 2. Validate all parts and stock
        for (InventoryDeductionRequest item : items) {
            Part part = validatePartExists(item.getPartId());
            validateSufficientStock(part, item.getQuantity());
            validateNotAlreadyDeducted(item.getServiceOrderItemId());
        }
        
        // 3. Deduct inventory (atomic operation)
        List<InventoryChange> changes = new ArrayList<>();
        for (InventoryDeductionRequest item : items) {
            InventoryChange change = deductFromPart(
                item.getPartId(),
                item.getQuantity(),
                item.getReason()
            );
            changes.add(change);
        }
        
        // 4. Update service order
        order.setInventoryDeductionStatus("COMPLETE");
        order.setTotalCost(calculateNewTotal(order));
        
        // 5. Create audit log
        createAuditLog(order, changes);
        
        // If all successful, transaction commits atomically
        return buildSuccessResponse(changes);
        
    } catch (ValidationException e) {
        // Transaction automatically rolled back
        logger.warn("Deduction failed: " + e.getMessage());
        return buildErrorResponse(e);
    }
}
```

### 5.4 Audit Trail Logging

```sql
-- Every inventory operation creates audit log entry
INSERT INTO inventory_history (
    part_id,
    transaction_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reference_id,
    reference_type,
    reason,
    notes,
    created_by,
    created_at
) VALUES (
    1,                      -- part_id
    'USAGE',                -- transaction_type
    -2,                     -- quantity_change
    7,                      -- quantity_before
    5,                      -- quantity_after
    5001,                   -- reference_id (service_order_item)
    'SERVICE_ORDER_ITEM',   -- reference_type
    'Used in service delivery',  -- reason
    'Service Order SO-2025-1001', -- notes
    123,                    -- created_by (user_id)
    NOW()                   -- created_at
);

-- Full audit trail enables:
- Part usage analytics
- Cost tracking
- Inventory trend analysis
- Compliance reporting
- Issue investigation
```

---

## 6. System Architecture & Data Flow Diagrams

### 6.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SPARE PARTS SYSTEM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              REST API LAYER (Controllers)                   │  │
│  │  ┌─────────────┬────────────────┬───────────────────────┐  │  │
│  │  │  Part CRUD  │ Inventory Mgmt │ Stock Alerts & Reports│  │  │
│  │  └─────────────┴────────────────┴───────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │           SERVICE LAYER (Business Logic)                    │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  SparePartsService                                  │   │  │
│  │  │  ├─ Part CRUD operations                            │   │  │
│  │  │  ├─ Inventory availability checks                   │   │  │
│  │  │  ├─ Automatic stock deduction                       │   │  │
│  │  │  ├─ Alert management                                │   │  │
│  │  │  └─ Inventory history tracking                      │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  InventoryService                                   │   │  │
│  │  │  ├─ Stock level management                          │   │  │
│  │  │  ├─ Automatic reorder point calculation             │   │  │
│  │  │  ├─ Status transition logic                         │   │  │
│  │  │  └─ Alert creation and management                   │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  ServiceOrderIntegrationService                     │   │  │
│  │  │  ├─ Inventory deduction on order completion         │   │  │
│  │  │  ├─ Usage tracking and logging                      │   │  │
│  │  │  └─ Cost calculation                                │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │           REPOSITORY LAYER (Data Access)                    │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │ PartRepository      ├─ findBySku()                 │    │  │
│  │  │ InventoryRepository │  findLowStockParts()         │    │  │
│  │  │ AlertRepository      │  findOutOfStockParts()      │    │  │
│  │  │ HistoryRepository    │  Custom queries             │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │                  DATABASE LAYER                             │  │
│  │  ┌──────────────┬─────────────┬───────────────┬──────────┐  │  │
│  │  │ parts        │ suppliers   │ inventory_    │ stock_   │  │  │
│  │  │              │             │ history       │ alerts   │  │  │
│  │  │ categories   │ part_       │ service_order_│ part_    │  │  │
│  │  │ units        │ suppliers   │ items         │ suppliers│  │  │
│  │  └──────────────┴─────────────┴───────────────┴──────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

External Integrations:
├─ ServiceOrderService (Deduct inventory on completion)
├─ NotificationService (Alert managers on low stock)
├─ ReportingService (Generate inventory reports)
└─ AuditService (Log all changes)
```

### 6.2 Service Usage Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│          SERVICE ORDER → INVENTORY DEDUCTION WORKFLOW               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   SERVICE ADVISOR       │
│  Creates Service Order  │
│  with Parts Needed      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 1. SELECT PARTS FOR SERVICE                            │
│    ├─ ENDPOINT: POST /api/service-orders/{id}/add-item │
│    ├─ Parts added to order                             │
│    └─ Stock availability checked (warning only)        │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 2. QUOTATION GENERATED                                  │
│    ├─ Parts list with prices                           │
│    ├─ Total cost calculated                            │
│    ├─ Sent to customer                                 │
│    └─ Status: PENDING (inventory NOT deducted yet)     │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 3. SERVICE APPROVED & IN PROGRESS                      │
│    ├─ Technician assigned                              │
│    ├─ Parts physically given to technician             │
│    ├─ Service work begins                              │
│    └─ Status: IN_PROGRESS                              │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 4. SERVICE COMPLETED - MANAGER CONFIRMS USAGE           │
│                                                         │
│    Technician/Manager reviews:                         │
│    ├─ Which parts were actually used                   │
│    ├─ Which parts were NOT used (return to stock)      │
│    └─ Submit: POST /api/spare-parts/usage/apply        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 5. INVENTORY DEDUCTION SYSTEM PROCESSES                │
│                                                        │
│    VALIDATION PHASE:                                   │
│    ├─ Part exists? ✓                                   │
│    ├─ Status not DISCONTINUED? ✓                       │
│    ├─ Quantity > 0? ✓                                  │
│    ├─ Current Stock >= Quantity? ✓                     │
│    └─ Not already deducted? ✓                          │
│                                                        │
│    If any validation fails → ROLLBACK & ERROR          │
│    If all valid → PROCEED                             │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 6. INVENTORY UPDATE TRANSACTION (ATOMIC)               │
│                                                        │
│    FOR EACH PART:                                      │
│    ├─ Current Stock -= Quantity Used                   │
│    ├─ Update Part status:                              │
│    │  ├─ If newStock = 0 → OUT_OF_STOCK               │
│    │  ├─ If newStock < minimum → LOW_STOCK            │
│    │  └─ If newStock >= minimum → ACTIVE              │
│    │                                                   │
│    ├─ Create Inventory History Record:                │
│    │  ├─ type: USAGE                                   │
│    │  ├─ reference: SERVICE_ORDER_ITEM                │
│    │  ├─ quantity_change: -X                           │
│    │  └─ reason: "Used in SO-XXXX"                     │
│    │                                                   │
│    ├─ Create Stock Alert (if low/out):                │
│    │  ├─ type: LOW_STOCK or OUT_OF_STOCK             │
│    │  ├─ severity: HIGH or CRITICAL                   │
│    │  └─ notify: ADMIN, BUSINESS_MANAGER              │
│    │                                                   │
│    └─ Update ServiceOrderItem:                         │
│       ├─ is_used: true                                 │
│       ├─ used_at: NOW()                                │
│       └─ cost_deducted: unit_price * quantity         │
│                                                        │
│    If ANY error → ROLLBACK ALL changes                 │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 7. RESPONSE TO USER                                     │
│                                                        │
│    SUCCESS:                                            │
│    ├─ ✓ Inventory deducted successfully               │
│    ├─ Parts deducted: Part1 (-2), Part2 (-1)           │
│    ├─ New stock levels: Part1 (3), Part2 (4)           │
│    ├─ Total cost: 30,000 VND                           │
│    ├─ Alerts created for low-stock items              │
│    └─ Status: COMPLETED                                │
│                                                        │
│    FAILURE:                                            │
│    ├─ ✗ Insufficient stock for Part2                  │
│    ├─ Need: 5 units, Available: 2 units               │
│    ├─ Suggestion: Reorder from supplier               │
│    ├─ Alternative: Use substitute Part3               │
│    └─ NO changes made (transaction rolled back)        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 8. NOTIFICATIONS & ALERTS SENT                          │
│                                                        │
│    Automatic notifications:                            │
│    ├─ Technician: Deduction complete                   │
│    ├─ Manager: Alert if stock low                      │
│    ├─ Inventory Team: Low-stock alert                  │
│    ├─ System: Create purchase order request            │
│    └─ Auditor: Deduction log entry                     │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Checklist

- [ ] Database schema created with all tables
- [ ] Part CRUD endpoints implemented
- [ ] Inventory availability check implemented
- [ ] Stock adjustment endpoints implemented
- [ ] Automatic status management implemented
- [ ] Inventory history tracking implemented
- [ ] Stock alert system implemented
- [ ] Service order integration implemented
- [ ] Batch inventory check implemented
- [ ] Reporting endpoints implemented
- [ ] Validation rules implemented
- [ ] Exception handling implemented
- [ ] Audit logging implemented
- [ ] Role-based access control implemented
- [ ] API documentation complete
- [ ] Swagger integration complete
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Performance testing done
- [ ] Security testing done

