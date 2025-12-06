# Spare Parts Management Module - Complete Deployment & API Testing Guide

## 1. Quick Start Deployment (5 Minutes)

### 1.1 Prerequisites

```
Required:
✓ Java 17+
✓ MySQL 8.0+
✓ Maven 3.6+
✓ Git (for version control)
✓ Postman or Curl (for API testing)

Verify Installation:
$ java -version
$ mysql --version
$ mvn --version
```

### 1.2 Database Setup (2 minutes)

```bash
# 1. Connect to MySQL
$ mysql -u root -p

# 2. Create database
mysql> CREATE DATABASE apexev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> USE apexev_db;

# 3. Run schema script
mysql> SOURCE /path/to/SPARE_PARTS_IMPLEMENTATION_GUIDE.md (schema section);

# 4. Verify tables created
mysql> SHOW TABLES;
mysql> DESC parts;
mysql> DESC inventory_history;

# 5. Load sample data
mysql> SOURCE /path/to/sample_data_insert.sql;

# 6. Verify data loaded
mysql> SELECT COUNT(*) FROM parts;
mysql> SELECT COUNT(*) FROM part_categories;
```

### 1.3 Application Configuration (1 minute)

```properties
# File: src/main/resources/application.properties

# Existing configuration...

# ========================================
# Spare Parts Module Configuration
# ========================================
# Stock Alert Background Job
spare-parts.alert-check-interval-minutes=5
spare-parts.low-stock-notification-enabled=true
spare-parts.out-of-stock-notification-enabled=true

# Inventory Limits
spare-parts.max-stock-level=10000
spare-parts.min-quantity-value=0.01

# Audit Trail
spare-parts.enable-audit-logging=true
spare-parts.keep-history-days=365
```

### 1.4 Build & Run (2 minutes)

```bash
# 1. Build project
$ cd /path/to/apexev
$ mvn clean install

# 2. Run application
$ mvn spring-boot:run

# OR run JAR directly
$ java -jar target/apexev-application.jar

# 3. Verify startup
# Look for: "Started ApexevApplication in X seconds"
# Check: No errors in console logs

# 4. Verify Swagger UI
$ Open browser: http://localhost:8080/swagger-ui.html
```

---

## 2. API Testing with Sample Requests

### 2.1 Authentication (Prerequisite for All Tests)

#### Get JWT Token

```bash
# Endpoint: POST /api/auth/login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apexev.com",
    "password": "admin123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600
}

# Save token for subsequent requests:
$ TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2.2 Part Management Endpoints

#### CREATE Part

```bash
# Endpoint: POST /api/spare-parts/create
# Role Required: ADMIN, BUSINESS_MANAGER

curl -X POST http://localhost:8080/api/spare-parts/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partCode": "MP-TEST-BATT-001",
    "partName": "Test Battery Component",
    "categoryId": 1,
    "unitId": 1,
    "description": "Test battery for electric vehicles",
    "minimumStockLevel": 5,
    "reorderQuantity": 20,
    "price": 12000000,
    "supplierId": 1
  }'

# Expected Response (201 Created):
{
  "id": 45,
  "partCode": "MP-TEST-BATT-001",
  "partName": "Test Battery Component",
  "category": {
    "id": 1,
    "name": "Battery"
  },
  "unit": {
    "id": 1,
    "name": "Piece",
    "abbreviation": "pc"
  },
  "currentStock": 0,
  "minimumStockLevel": 5,
  "reorderQuantity": 20,
  "price": 12000000.00,
  "supplier": {
    "id": 1,
    "name": "Supplier ABC"
  },
  "status": "ACTIVE",
  "inStock": false,
  "createdAt": "2025-12-01T16:45:30.123Z"
}

# Error Response (400 Bad Request):
{
  "timestamp": "2025-12-01T16:45:30.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Part code format invalid. Use uppercase letters, numbers, and hyphens.",
  "path": "/api/spare-parts/create",
  "details": {
    "field": "partCode",
    "rejectedValue": "mp-test-001",
    "reason": "must match pattern ^[A-Z0-9-]+$"
  }
}

# Error Response (409 Conflict):
{
  "timestamp": "2025-12-01T16:45:30.123Z",
  "status": 409,
  "error": "Conflict",
  "message": "Part code MP-TEST-BATT-001 already exists",
  "path": "/api/spare-parts/create",
  "suggestions": [
    "Use a unique part code",
    "View existing part instead"
  ]
}
```

#### GET Part Details

```bash
# Endpoint: GET /api/spare-parts/{partId}
# Role Required: Authenticated

curl -X GET http://localhost:8080/api/spare-parts/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V",
  "category": {
    "id": 1,
    "name": "Battery"
  },
  "unit": {
    "id": 1,
    "name": "Piece",
    "abbreviation": "pc"
  },
  "currentStock": 3,
  "minimumStockLevel": 5,
  "reorderQuantity": 20,
  "price": 15000000.00,
  "supplier": {
    "id": 1,
    "name": "Supplier ABC"
  },
  "status": "LOW_STOCK",
  "inStock": true,
  "needsReorder": true,
  "createdAt": "2025-12-01T08:00:00Z",
  "updatedAt": "2025-12-01T14:30:00Z",
  "recentUsage": [
    {
      "date": "2025-12-01T09:00:00Z",
      "quantity": 2,
      "serviceOrder": "SO-2025-1001",
      "technician": "John Doe"
    }
  ],
  "inventoryHistory": [
    {
      "date": "2025-12-01T09:00:00Z",
      "type": "USAGE",
      "quantity": -2,
      "before": 5,
      "after": 3,
      "reason": "Used in service SO-2025-1001"
    }
  ]
}

# Error Response (404 Not Found):
{
  "timestamp": "2025-12-01T16:45:30.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Part not found with ID: 999",
  "path": "/api/spare-parts/999"
}
```

#### UPDATE Part

```bash
# Endpoint: PUT /api/spare-parts/{partId}
# Role Required: ADMIN, BUSINESS_MANAGER

curl -X PUT http://localhost:8080/api/spare-parts/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partName": "Bộ pin xe Vento 48V (Updated)",
    "minimumStockLevel": 8,
    "reorderQuantity": 25,
    "price": 14500000
  }'

# Expected Response (200 OK):
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "partName": "Bộ pin xe Vento 48V (Updated)",
  "minimumStockLevel": 8,
  "reorderQuantity": 25,
  "price": 14500000.00,
  "updatedAt": "2025-12-01T16:50:00.123Z",
  "updatedBy": {
    "id": 1,
    "name": "Admin User"
  }
}
```

#### DELETE Part (Soft Delete)

```bash
# Endpoint: DELETE /api/spare-parts/{partId}
# Role Required: ADMIN

curl -X DELETE http://localhost:8080/api/spare-parts/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (204 No Content):
# (Empty body)

# OR Response (200 OK with status):
{
  "message": "Part marked as DISCONTINUED",
  "partId": 1,
  "status": "DISCONTINUED"
}

# Verify soft delete:
curl -X GET http://localhost:8080/api/spare-parts/1 \
  -H "Authorization: Bearer $TOKEN"

# Response shows:
{
  "id": 1,
  "partCode": "MP-VENTO-BATT-001",
  "status": "DISCONTINUED"  # ← Changed from ACTIVE
}
```

#### LIST Parts (Pagination & Filtering)

```bash
# Endpoint: GET /api/spare-parts?page=0&size=20&category=1&status=ACTIVE&search=battery
# Role Required: Authenticated

curl -X GET "http://localhost:8080/api/spare-parts?page=0&size=10&status=ACTIVE" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "partCode": "MP-VENTO-BATT-001",
      "partName": "Bộ pin xe Vento 48V",
      "category": "Battery",
      "currentStock": 3,
      "minimumStockLevel": 5,
      "price": 15000000.00,
      "status": "LOW_STOCK",
      "inStock": true
    },
    {
      "id": 4,
      "partCode": "MP-COOL-RAD-001",
      "partName": "Radiator Assembly",
      "category": "Cooling System",
      "currentStock": 8,
      "minimumStockLevel": 10,
      "price": 5000000.00,
      "status": "ACTIVE",
      "inStock": true
    }
  ],
  "totalElements": 38,
  "totalPages": 4,
  "currentPage": 0,
  "pageSize": 10
}
```

### 2.3 Inventory Management Endpoints

#### CHECK Stock Availability (Single)

```bash
# Endpoint: POST /api/spare-parts/inventory/check
# Role Required: Authenticated

curl -X POST http://localhost:8080/api/spare-parts/inventory/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partId": 1,
    "requiredQuantity": 3
  }'

# Response - Stock Available (200 OK):
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

# Response - Stock Insufficient (200 OK):
{
  "partId": 2,
  "partCode": "MP-MOTOR-A1",
  "partName": "Motor Controller",
  "currentStock": 0,
  "requiredQuantity": 3,
  "available": false,
  "insufficientBy": 3,
  "willNeedReorder": true,
  "recommendations": [
    {
      "action": "WARN",
      "message": "Insufficient stock. Need 3 more units.",
      "alternativeSuppliers": [
        {
          "id": 2,
          "name": "Supplier XYZ",
          "leadTime": "2 days"
        }
      ]
    },
    {
      "action": "WAIT_OR_SUBSTITUTE",
      "message": "Can substitute with compatible part MP-MOTOR-A2 (5 in stock)"
    }
  ]
}
```

#### CHECK Stock Availability (Batch)

```bash
# Endpoint: POST /api/spare-parts/inventory/check-batch
# Role Required: Authenticated

curl -X POST http://localhost:8080/api/spare-parts/inventory/check-batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"partId": 1, "requiredQuantity": 3},
      {"partId": 2, "requiredQuantity": 5},
      {"partId": 3, "requiredQuantity": 2}
    ]
  }'

# Expected Response (200 OK):
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
      "insufficientBy": 5
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

#### ADJUST Inventory

```bash
# Endpoint: PATCH /api/spare-parts/{partId}/inventory/adjust
# Role Required: ADMIN, BUSINESS_MANAGER

curl -X PATCH http://localhost:8080/api/spare-parts/1/inventory/adjust \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantityAdjustment": -2,
    "reason": "DAMAGE",
    "notes": "2 units damaged during storage",
    "documentReference": "DAM-2025-001"
  }'

# Expected Response (200 OK):
{
  "partId": 1,
  "partCode": "MP-VENTO-BATT-001",
  "quantityBefore": 7,
  "quantityAfter": 5,
  "quantityChange": -2,
  "reason": "DAMAGE",
  "notes": "2 units damaged during storage",
  "adjustedAt": "2025-12-01T14:30:00.123Z",
  "adjustedBy": {
    "id": 1,
    "name": "Manager Name"
  }
}

# Error Response - Negative Inventory (400 Bad Request):
{
  "timestamp": "2025-12-01T16:45:30.123Z",
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

#### DEDUCT Inventory on Service Completion

```bash
# Endpoint: POST /api/spare-parts/usage/apply-to-order
# Role Required: TECHNICIAN, SERVICE_ADVISOR, ADMIN

curl -X POST http://localhost:8080/api/spare-parts/usage/apply-to-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Expected Response - Success (200 OK):
{
  "serviceOrderId": 101,
  "deductionStatus": "SUCCESS",
  "itemsProcessed": 2,
  "totalCost": 30000000.00,
  "inventory_adjustments": [
    {
      "partId": 1,
      "partCode": "MP-VENTO-BATT-001",
      "quantityDeducted": 2,
      "stockAfter": 3,
      "costDeducted": 30000000.00,
      "timestamp": "2025-12-01T15:00:00.123Z"
    },
    {
      "partId": 3,
      "partCode": "MP-SENSOR-01",
      "quantityDeducted": 1,
      "stockAfter": 4,
      "costDeducted": 2500000.00,
      "timestamp": "2025-12-01T15:00:00.123Z"
    }
  ],
  "auditLog": "Inventory deducted for service order SO-2025-1001"
}

# Expected Response - Failure (400 Bad Request):
{
  "timestamp": "2025-12-01T16:45:30.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient stock for MP-MOTOR-A1",
  "path": "/api/spare-parts/usage/apply-to-order",
  "details": {
    "partCode": "MP-MOTOR-A1",
    "required": 3,
    "available": 0,
    "insufficientBy": 3
  },
  "suggestions": [
    "Wait for stock replenishment",
    "Use alternative part",
    "Defer service completion"
  ]
}
```

### 2.4 Alert Management Endpoints

#### GET Low Stock Alerts

```bash
# Endpoint: GET /api/spare-parts/alerts/low-stock?threshold=10
# Role Required: ADMIN, BUSINESS_MANAGER, SERVICE_ADVISOR

curl -X GET "http://localhost:8080/api/spare-parts/alerts/low-stock" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
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
      "supplier": {
        "id": 1,
        "name": "Supplier ABC"
      },
      "suggestedOrderQuantity": 20,
      "createdAt": "2025-12-01T08:00:00.123Z",
      "isAcknowledged": false
    },
    {
      "alertId": 2,
      "part": {
        "id": 2,
        "partCode": "MP-MOTOR-A1",
        "partName": "Motor Controller",
        "currentStock": 0,
        "minimumStockLevel": 5
      },
      "alertType": "OUT_OF_STOCK",
      "severity": "CRITICAL",
      "daysUntilStockout": 0,
      "supplier": {
        "id": 1,
        "name": "Supplier ABC"
      },
      "suggestedOrderQuantity": 20,
      "createdAt": "2025-12-01T10:00:00.123Z",
      "isAcknowledged": false
    }
  ],
  "totalAlerts": 2,
  "criticalCount": 1,
  "highCount": 1,
  "mediumCount": 0
}
```

#### ACKNOWLEDGE Alert

```bash
# Endpoint: PATCH /api/spare-parts/alerts/{alertId}/acknowledge
# Role Required: ADMIN, BUSINESS_MANAGER

curl -X PATCH http://localhost:8080/api/spare-parts/alerts/1/acknowledge \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "alertId": 1,
  "acknowledged": true,
  "acknowledgedBy": {
    "id": 1,
    "name": "Manager Name"
  },
  "acknowledgedAt": "2025-12-01T15:30:00.123Z"
}
```

### 2.5 Reporting Endpoints

#### GET Inventory History

```bash
# Endpoint: GET /api/spare-parts/{partId}/history?from=2025-12-01&to=2025-12-07&type=USAGE
# Role Required: Authenticated

curl -X GET "http://localhost:8080/api/spare-parts/1/history?from=2025-12-01&to=2025-12-07" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "partId": 1,
  "partCode": "MP-VENTO-BATT-001",
  "history": [
    {
      "historyId": 1,
      "date": "2025-12-01T09:00:00.123Z",
      "type": "USAGE",
      "quantity": -2,
      "before": 7,
      "after": 5,
      "reference": {
        "type": "SERVICE_ORDER",
        "id": "SO-2025-1001"
      },
      "reason": "Used in service delivery",
      "recordedBy": "Tech John"
    },
    {
      "historyId": 2,
      "date": "2025-12-02T10:00:00.123Z",
      "type": "ADJUSTMENT",
      "quantity": 10,
      "before": 5,
      "after": 15,
      "reference": {
        "type": "PURCHASE_ORDER",
        "id": "PO-2025-0501"
      },
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

#### GET Inventory Report

```bash
# Endpoint: GET /api/spare-parts/reports/inventory-summary?category=1&includeHistorical=true
# Role Required: ADMIN, BUSINESS_MANAGER

curl -X GET "http://localhost:8080/api/spare-parts/reports/inventory-summary" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "reportDate": "2025-12-01T16:00:00.123Z",
  "generatedBy": "system",
  "summary": {
    "totalParts": 45,
    "totalValue": 1500000000.00,
    "partsInStock": 38,
    "partsOutOfStock": 4,
    "partsLowStock": 3
  },
  "byCategory": [
    {
      "category": "Battery",
      "totalParts": 8,
      "totalQuantity": 45,
      "totalValue": 450000000.00,
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

## 3. Postman Collection Setup

### 3.1 Import Collection

```json
{
  "info": {
    "name": "Spare Parts Management API",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@apexev.com\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Part Management",
      "item": [
        {
          "name": "Create Part",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/spare-parts/create",
            "auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{jwt_token}}"}]},
            "body": {"mode": "raw", "raw": "..."}
          }
        },
        {
          "name": "Get Part",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/spare-parts/1"
          }
        }
      ]
    },
    {
      "name": "Inventory Management",
      "item": [
        {
          "name": "Check Stock",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/spare-parts/inventory/check"
          }
        },
        {
          "name": "Adjust Inventory",
          "request": {
            "method": "PATCH",
            "url": "{{base_url}}/api/spare-parts/1/inventory/adjust"
          }
        }
      ]
    }
  ]
}
```

### 3.2 Postman Variables

```
Environment: ApexEV Spare Parts

Variables:
- base_url: http://localhost:8080
- jwt_token: [Auto-populated after login]
- admin_email: admin@apexev.com
- admin_password: admin123
- manager_email: manager@apexev.com
- manager_password: manager123
- technician_email: technician@apexev.com
- technician_password: technician123
```

---

## 4. Performance Tuning & Monitoring

### 4.1 Database Indexes for Performance

```sql
-- Already created in schema, but verify:

SHOW INDEX FROM parts;
SHOW INDEX FROM inventory_history;
SHOW INDEX FROM stock_alerts;

-- Create additional indexes if needed:
CREATE INDEX idx_part_code_status 
  ON parts(part_code, status);

CREATE INDEX idx_history_part_date 
  ON inventory_history(part_id, created_at);

CREATE INDEX idx_alert_part_type 
  ON stock_alerts(part_id, alert_type, is_acknowledged);
```

### 4.2 Response Time Metrics (Target)

```
API Endpoint                              Target    Typical
─────────────────────────────────────────────────────────────
GET /spare-parts                          < 100ms   50-80ms
GET /spare-parts/{id}                     < 100ms   40-60ms
POST /spare-parts/create                  < 200ms   100-150ms
POST /spare-parts/inventory/check         < 100ms   50-80ms
POST /spare-parts/usage/apply-to-order    < 500ms   200-400ms
GET /spare-parts/alerts/low-stock         < 150ms   80-120ms
GET /spare-parts/reports/inventory        < 300ms   150-250ms

Query Performance:
- Simple lookups (by ID): < 20ms
- List with pagination: < 50ms (100 items/page)
- Batch operations (10 items): < 150ms
- Full inventory report: < 300ms
```

### 4.3 Monitoring Setup

```bash
# Add to application.properties:

# Actuator endpoints for monitoring
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.enable.jvm=true
management.health.diskspace.threshold=500MB

# Logging
logging.level.com.apexev.service.SparePartsServiceImpl=INFO
logging.level.com.apexev.repository=DEBUG (only in dev)

# Custom metrics
management.metrics.tags.application=apexev-spare-parts
management.metrics.tags.environment=production
```

### 4.4 Health Check

```bash
# Endpoint: GET /actuator/health

curl http://localhost:8080/actuator/health

# Expected Response:
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 107374182400,
        "free": 53687091200,
        "threshold": 536870912
      }
    }
  }
}
```

---

## 5. Troubleshooting Guide

### 5.1 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 Part Not Found | Wrong part ID | Verify part exists: `SELECT * FROM parts WHERE part_id = X` |
| 409 Duplicate Part Code | Part code already exists | Use unique part code or check if resubmitting |
| 400 Invalid Input | Validation failed | Check error message for specific field validation issue |
| 401 Unauthorized | Missing/invalid JWT token | Regenerate token: `POST /api/auth/login` |
| 403 Forbidden | Insufficient role | Verify user role in JWT token |
| 500 Server Error | Application error | Check application logs for stack trace |
| Slow queries | Missing indexes | Run index creation scripts from deployment guide |
| Out of Memory | Too many records | Check heap size: `java -Xmx1024m -jar app.jar` |

### 5.2 Log Files Location

```
Main Logs:
  - Linux/Mac: ~/logs/apexev.log
  - Windows: C:\apexev\logs\apexev.log

Debug Logs:
  - src/main/resources/logback-spring.xml
  - Configure log levels in application.properties

Console Output:
  - Watch for errors during startup
  - Look for "Started ApexevApplication" message
```

---

## 6. Maintenance Tasks

### 6.1 Regular Maintenance

```sql
-- Monthly: Cleanup old inventory history (keep 1 year)
DELETE FROM inventory_history 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Quarterly: Analyze table performance
ANALYZE TABLE parts;
ANALYZE TABLE inventory_history;
ANALYZE TABLE stock_alerts;

-- Annually: Review and archive old alerts
DELETE FROM stock_alerts 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
  AND is_acknowledged = true;
```

### 6.2 Backup Strategy

```bash
# Daily backup at 2 AM
# File: /etc/cron.d/mysql-backup

0 2 * * * mysqldump -u root -p apexev_db | gzip > /backup/apexev_$(date +\%Y\%m\%d).sql.gz

# Restore from backup:
# gunzip < apexev_20251201.sql.gz | mysql -u root -p apexev_db
```

---

## 7. Success Criteria Checklist

After deployment, verify:

- [ ] All tables created successfully
- [ ] Sample data loaded (8+ parts visible)
- [ ] Application starts without errors
- [ ] Swagger UI accessible at http://localhost:8080/swagger-ui.html
- [ ] JWT authentication working (login returns token)
- [ ] Create part endpoint returns 201 with new ID
- [ ] Get part endpoint returns 200 with correct data
- [ ] Stock check endpoint returns accurate availability
- [ ] Inventory adjust creates history entry
- [ ] Service order deduction processes successfully
- [ ] Low stock alerts created automatically
- [ ] All validation rules enforced (no duplicate codes, no negative inventory)
- [ ] Error messages display correctly for edge cases
- [ ] Pagination works on list endpoints
- [ ] Search/filter functionality works
- [ ] Role-based access control enforced
- [ ] Response times meet targets (< 500ms for complex operations)
- [ ] Audit logging captures all changes
- [ ] Database indexes improve query performance

---

## 8. Documentation References

- **API Documentation**: Swagger UI - http://localhost:8080/swagger-ui.html
- **Database Schema**: SPARE_PARTS_IMPLEMENTATION_GUIDE.md
- **UI Wireframes**: SPARE_PARTS_UI_WIREFRAMES.md
- **Technical Spec**: SPARE_PARTS_TECHNICAL_SPEC.md
- **Implementation Guide**: SPARE_PARTS_IMPLEMENTATION_GUIDE.md
- **Quick Start**: SPARE_PARTS_QUICKSTART.md

