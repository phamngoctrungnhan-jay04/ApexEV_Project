# Spare Parts Management Module - Database Setup & Implementation Guide

## 1. Database Schema Setup Scripts

### 1.1 Create All Required Tables

```sql
-- ========================================
-- SPARE PARTS MANAGEMENT SYSTEM
-- Database Setup Script
-- ========================================

-- Run this script against your MySQL database to set up the schema
-- Assumes UTF8MB4 collation for Vietnamese character support

USE apexev_db;

-- ========================================
-- 1. PART CATEGORIES TABLE
-- ========================================
CREATE TABLE part_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL UNIQUE COMMENT 'Category name',
    description LONGTEXT COMMENT 'Category description',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Category status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    
    INDEX idx_name (category_name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Part categories like Battery, Motor, Cooling System';

-- ========================================
-- 2. UNITS OF MEASUREMENT TABLE
-- ========================================
CREATE TABLE units (
    unit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unit name',
    unit_abbreviation VARCHAR(10) COMMENT 'Unit abbreviation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_abbreviation (unit_abbreviation),
    INDEX idx_name (unit_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Units of measurement: Piece, Kilogram, Box, etc.';

-- ========================================
-- 3. SUPPLIERS TABLE
-- ========================================
CREATE TABLE suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique supplier code',
    supplier_name NVARCHAR(255) NOT NULL COMMENT 'Supplier business name',
    contact_person NVARCHAR(100) COMMENT 'Contact person name',
    email VARCHAR(255) COMMENT 'Email address',
    phone VARCHAR(20) COMMENT 'Phone number',
    address LONGTEXT COMMENT 'Physical address',
    city NVARCHAR(100) COMMENT 'City name',
    country NVARCHAR(100) COMMENT 'Country name',
    status VARCHAR(50) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, BLOCKED',
    payment_terms VARCHAR(100) COMMENT 'Payment terms description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_status (status),
    INDEX idx_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Supplier/Vendor information';

-- ========================================
-- 4. PARTS TABLE (ENHANCED)
-- ========================================
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
    INDEX idx_category (category_id),
    INDEX idx_minimum_stock (minimum_stock_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Spare parts with inventory management';

-- ========================================
-- 5. PART SUPPLIER MAPPING TABLE
-- ========================================
CREATE TABLE part_suppliers (
    part_supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    supplier_part_code VARCHAR(100) COMMENT 'Part code assigned by supplier',
    supplier_price DECIMAL(10, 2) COMMENT 'Supplier price for this part',
    lead_time_days INT COMMENT 'Days to receive order',
    minimum_order_quantity INT COMMENT 'Minimum quantity per order',
    is_preferred BOOLEAN DEFAULT FALSE COMMENT 'Preferred supplier for this part',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    UNIQUE KEY uk_part_supplier (part_id, supplier_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_preferred (is_preferred)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Many-to-many relationship between parts and suppliers';

-- ========================================
-- 6. INVENTORY HISTORY TABLE
-- ========================================
CREATE TABLE inventory_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL COMMENT 'PURCHASE, USAGE, ADJUSTMENT, DAMAGE, RETURN, LOSS',
    quantity_change INT NOT NULL COMMENT 'Can be positive or negative',
    quantity_before INT NOT NULL COMMENT 'Stock level before transaction',
    quantity_after INT NOT NULL COMMENT 'Stock level after transaction',
    reference_id BIGINT COMMENT 'References service_order_item or purchase_order',
    reference_type VARCHAR(50) COMMENT 'SERVICE_ORDER_ITEM, PURCHASE_ORDER, MANUAL_ADJUSTMENT',
    reason NVARCHAR(255) COMMENT 'Reason for transaction',
    notes LONGTEXT COMMENT 'Additional notes',
    created_by BIGINT COMMENT 'User who recorded transaction',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_id, reference_type),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Complete audit trail of all inventory transactions';

-- ========================================
-- 7. STOCK ALERTS TABLE
-- ========================================
CREATE TABLE stock_alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    alert_type VARCHAR(50) NOT NULL COMMENT 'LOW_STOCK, OUT_OF_STOCK, OVERSTOCK',
    current_stock INT COMMENT 'Stock level when alert created',
    threshold_value INT COMMENT 'Threshold that triggered alert',
    severity VARCHAR(50) DEFAULT 'MEDIUM' COMMENT 'LOW, MEDIUM, HIGH, CRITICAL',
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(user_id),
    
    INDEX idx_part_id (part_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_is_acknowledged (is_acknowledged),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stock alerts for low/out-of-stock situations';

-- ========================================
-- 8. SERVICE ORDER ITEMS ENHANCEMENT
-- ========================================
-- Add new columns to existing service_order_items table
ALTER TABLE service_order_items 
ADD COLUMN part_id BIGINT COMMENT 'Reference to Part entity' AFTER item_ref_id,
ADD COLUMN supplier_id BIGINT COMMENT 'Supplier used for this part' AFTER part_id,
ADD COLUMN is_used BOOLEAN DEFAULT FALSE COMMENT 'Whether part was actually used',
ADD COLUMN used_at TIMESTAMP NULL COMMENT 'When part was deducted from inventory',
ADD FOREIGN KEY (part_id) REFERENCES parts(part_id),
ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
ADD INDEX idx_part_id (part_id),
ADD INDEX idx_is_used (is_used);

-- ========================================
-- 9. PART STATUS ENUM VALUES
-- ========================================
-- Status values for parts:
-- ACTIVE: Part is available for use
-- INACTIVE: Temporarily unavailable
-- DISCONTINUED: Part is no longer available
-- OUT_OF_STOCK: Stock level is zero

```

### 1.2 Sample Data Insert Script

```sql
-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert Categories
INSERT INTO part_categories (category_name, description) VALUES
('Battery', 'Replacement batteries for electric vehicles'),
('Motor Components', 'Electric motor parts and components'),
('Cooling System', 'Radiators, fans, and cooling components'),
('Electrical Components', 'Wiring, connectors, switches'),
('Suspension', 'Shock absorbers, springs, struts'),
('Brake System', 'Brake pads, rotors, calipers');

-- Insert Units
INSERT INTO units (unit_name, unit_abbreviation) VALUES
('Piece', 'pc'),
('Kilogram', 'kg'),
('Meter', 'm'),
('Liter', 'l'),
('Box', 'box'),
('Set', 'set');

-- Insert Suppliers
INSERT INTO suppliers (supplier_code, supplier_name, contact_person, email, phone, status) VALUES
('SUP-001', 'Supplier ABC Co., Ltd', 'Mr. Tran Van A', 'contact@abc-supplier.vn', '0912345678', 'ACTIVE'),
('SUP-002', 'Supplier XYZ Corporation', 'Ms. Nguyen Thi B', 'sales@xyz-corp.vn', '0923456789', 'ACTIVE'),
('SUP-003', 'Supplier DEF Trading', 'Mr. Hoang Van C', 'info@def-trading.vn', '0934567890', 'ACTIVE'),
('SUP-004', 'Supplier GHI Industries', 'Ms. Pham Thi D', 'business@ghi-ind.vn', '0945678901', 'INACTIVE');

-- Insert Sample Parts
INSERT INTO parts (part_code, part_name, category_id, unit_id, description, current_stock, minimum_stock_level, reorder_quantity, price, supplier_id, status, created_by) VALUES
('MP-VENTO-BATT-001', 'Bộ pin xe Vento 48V', 1, 1, 'Pin lithium 48V 100Ah cao cấp', 3, 5, 20, 15000000.00, 1, 'ACTIVE', 1),
('MP-MOTOR-A1', 'Motor Controller', 2, 1, 'Bộ điều khiển động cơ chính', 0, 5, 10, 8000000.00, 1, 'OUT_OF_STOCK', 1),
('MP-SENSOR-01', 'Temperature Sensor', 4, 1, 'Cảm biến nhiệt độ', 2, 10, 15, 2500000.00, 2, 'ACTIVE', 1),
('MP-COOL-RAD-001', 'Radiator Assembly', 3, 1, 'Tập hợp tản nhiệt', 8, 10, 20, 5000000.00, 1, 'ACTIVE', 1),
('MP-BRAKE-PAD-01', 'Brake Pad Set', 6, 1, 'Bộ má phanh', 12, 20, 30, 3000000.00, 2, 'ACTIVE', 1),
('MP-SUSP-SHOCK-01', 'Shock Absorber', 5, 2, 'Bộ giảm xóc', 5, 8, 12, 4500000.00, 3, 'ACTIVE', 1),
('MP-ELECT-WIRE-01', 'Wiring Harness', 4, 1, 'Bộ dây điện', 15, 12, 25, 1200000.00, 2, 'ACTIVE', 1),
('MP-CONNECT-001', 'Connector Set', 4, 1, 'Bộ kết nối điện', 6, 10, 20, 800000.00, 3, 'ACTIVE', 1);

-- Insert Part-Supplier relationships
INSERT INTO part_suppliers (part_id, supplier_id, supplier_part_code, supplier_price, lead_time_days, minimum_order_quantity, is_preferred) VALUES
(1, 1, 'SUP-ABC-BATT-001', 14500000.00, 3, 10, TRUE),
(1, 2, 'SUP-XYZ-BATT-001', 14800000.00, 5, 15, FALSE),
(2, 1, 'SUP-ABC-MOTOR-001', 7800000.00, 4, 5, TRUE),
(2, 3, 'SUP-DEF-MOTOR-001', 8200000.00, 7, 3, FALSE),
(3, 2, 'SUP-XYZ-SENSOR-001', 2400000.00, 2, 10, TRUE),
(4, 1, 'SUP-ABC-COOL-001', 4800000.00, 3, 8, TRUE),
(5, 2, 'SUP-XYZ-BRAKE-001', 2900000.00, 2, 15, TRUE);

-- Insert Sample Inventory History
INSERT INTO inventory_history (part_id, transaction_type, quantity_change, quantity_before, quantity_after, reference_type, reason, notes, created_by, created_at) VALUES
(1, 'PURCHASE', 20, 0, 20, 'PURCHASE_ORDER', 'Initial stock from supplier', 'PO-2025-001', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 'USAGE', -2, 20, 18, 'SERVICE_ORDER_ITEM', 'Used in SO-2025-0990', 'Service order SO-2025-0990', 2, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(1, 'USAGE', -5, 18, 13, 'SERVICE_ORDER_ITEM', 'Used in multiple services', 'Weekly usage', 2, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(1, 'ADJUSTMENT', 10, 13, 23, 'MANUAL_ADJUSTMENT', 'Stock correction', 'Physical inventory count correction', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 'USAGE', -20, 23, 3, 'SERVICE_ORDER_ITEM', 'Used in services last week', 'High usage week', 2, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert Stock Alerts
INSERT INTO stock_alerts (part_id, alert_type, current_stock, threshold_value, severity, is_acknowledged) VALUES
(1, 'LOW_STOCK', 3, 5, 'HIGH', FALSE),
(2, 'OUT_OF_STOCK', 0, 5, 'CRITICAL', FALSE),
(3, 'LOW_STOCK', 2, 10, 'HIGH', FALSE);
```

---

## 2. Implementation Workflows

### 2.1 Part Creation Workflow

```
SCENARIO: Business Manager creates new spare part

1. Navigate to Spare Parts → Create New Part
   
2. Fill in Part Information:
   - Part Code: MP-MOTOR-NEW-01
   - Part Name: New Motor Component
   - Category: Motor Components
   - Unit: Piece
   - Unit Price: ₫9,000,000
   
3. System validates:
   - ✓ Part code format (MP-MOTOR-NEW-01 matches ^[A-Z0-9-]+$)
   - ✓ Part code unique (not in database)
   - ✓ Part name not empty
   - ✓ Category exists
   - ✓ Price > 0

4. Fill in Optional Information:
   - Description: High-performance motor component
   - Minimum Stock: 8 units
   - Reorder Quantity: 15 units
   - Primary Supplier: Supplier ABC

5. System validates supplier relationship:
   - ✓ Supplier exists and is ACTIVE
   - ✓ Can add part-supplier mapping

6. Click [Create Part]
   
7. System:
   - Inserts into parts table
   - Sets status = ACTIVE, current_stock = 0
   - Sets created_at, created_by
   - Creates part-supplier relationship
   - Returns success response

8. Response shows:
   - ✓ Part created successfully
   - New Part ID: 45
   - Show part details
   - Buttons: [Edit] [Add Stock] [View] [Delete]

RESULT: New part ready for inventory management
```

### 2.2 Inventory Adjustment Workflow

```
SCENARIO: Inventory Manager adjusts stock due to damage

1. Navigate to Spare Parts → MP-VENTO-BATT-001 → Adjust Inventory
   
2. System shows current state:
   - Part: MP-VENTO-BATT-001
   - Current Stock: 7 units
   - Minimum Level: 5 units
   - Status: ACTIVE

3. Select adjustment type:
   - Type: DAMAGE

4. Enter adjustment amount:
   - Quantity: -2 (reducing stock)
   - Reason: Damaged in warehouse during storage
   - Reference: DAM-2025-001 (damage report reference)

5. System validates:
   - ✓ After adjustment: 7 + (-2) = 5 (not negative)
   - ✓ Adjustment reason valid
   - ✓ Part exists

6. Review preview:
   - Before: 7 units
   - After: 5 units
   - Status change: ACTIVE → LOW_STOCK (5 = minimum)
   - Alert: Will create LOW_STOCK alert
   - Audit: Recorded as DAMAGE adjustment

7. Click [Confirm Adjustment]
   
8. System executes (transactional):
   - Update parts.current_stock = 5
   - Update parts.status = LOW_STOCK
   - Insert inventory_history record
   - Create stock_alerts entry
   - Notify ADMIN and BUSINESS_MANAGER

9. Response:
   - ✓ Adjustment successful
   - Show updated stock: 5 units
   - Show new status: LOW_STOCK ⚠️
   - Show audit log entry
   - Confirm alert created and notifications sent

RESULT: Inventory adjusted, alert created, audit trail recorded
```

### 2.3 Service Order Completion & Inventory Deduction Workflow

```
SCENARIO: Complete service order with automatic inventory deduction

1. Service Order Status: IN_PROGRESS
   SO-2025-1001
   Customer: Nguyen Van A
   Vehicle: Honda EV 2025
   
   Parts in Order:
   - MP-VENTO-BATT-001: 1 unit (₫15M) - Stock: 3
   - MP-MOTOR-A1: 1 unit (₫8M) - Stock: 0
   - MP-SENSOR-01: 1 unit (₫2.5M) - Stock: 2

2. Technician completes work, submits usage report:
   - MP-VENTO-BATT-001: USED ✓ (1 unit)
   - MP-MOTOR-A1: NOT_USED (deferred, not available)
   - MP-SENSOR-01: USED ✓ (1 unit)

3. Service Advisor/Manager reviews in system:
   Navigate to Service Order → SO-2025-1001 → Complete Service

4. Confirm parts usage:
   - For each part, confirm: Yes/No/Partial
   - Set quantity to deduct if different from ordered

5. System validation phase:
   ✓ Service order exists and IN_PROGRESS
   ✓ MP-VENTO-BATT-001: Can deduct 1 from 3 = ✓
   ✓ MP-MOTOR-A1: Not deducting (NOT_USED) = ✓
   ✓ MP-SENSOR-01: Can deduct 1 from 2 = ✓
   ✓ No duplicate deduction
   ✓ Parts not DISCONTINUED

6. Click [Apply Deduction]
   
7. System executes atomically (SERIALIZABLE isolation):
   
   FOR MP-VENTO-BATT-001:
   ├─ Deduct: current_stock = 3 - 1 = 2
   ├─ Update part.status = ACTIVE (2 > 5? No, still ACTIVE)
   ├─ Create inventory_history:
   │  ├─ type: USAGE
   │  ├─ quantity_change: -1
   │  ├─ quantity_before: 3
   │  ├─ quantity_after: 2
   │  ├─ reference: SERVICE_ORDER_ITEM (5001)
   │  └─ reason: "Used in service SO-2025-1001"
   ├─ Update service_order_item:
   │  ├─ is_used: true
   │  ├─ used_at: NOW()
   │  └─ supplier_id: 1
   └─ No alert needed (2 > 5)
   
   FOR MP-MOTOR-A1:
   ├─ Skip deduction (NOT_USED)
   ├─ Update service_order_item:
   │  └─ is_used: false
   └─ Status remains OUT_OF_STOCK
   
   FOR MP-SENSOR-01:
   ├─ Deduct: current_stock = 2 - 1 = 1
   ├─ Update part.status = LOW_STOCK (1 < 10)
   ├─ Create inventory_history:
   │  ├─ type: USAGE
   │  ├─ quantity_change: -1
   │  ├─ quantity_before: 2
   │  └─ quantity_after: 1
   ├─ Create stock_alerts:
   │  ├─ alert_type: LOW_STOCK
   │  ├─ severity: HIGH
   │  └─ threshold: 10
   ├─ Update service_order_item:
   │  ├─ is_used: true
   │  └─ used_at: NOW()
   └─ Notify ADMIN, BUSINESS_MANAGER
   
   IF ANY ERROR:
   └─ ROLLBACK all changes, return error

8. Update Service Order:
   ├─ status: COMPLETED
   ├─ inventory_deduction_status: COMPLETE
   ├─ total_cost = recalculate (15M + 0M + 2.5M = 17.5M)
   └─ completed_at: NOW()

9. Create audit log:
   ├─ action: INVENTORY_DEDUCTION
   ├─ service_order_id: SO-2025-1001
   ├─ items_processed: 2
   ├─ total_cost_deducted: 17,500,000
   ├─ user: Current manager
   └─ timestamp: NOW()

10. Send notifications:
    ├─ Technician: Service complete notification
    ├─ Inventory Manager:
    │  ├─ Deduction complete
    │  ├─ Alert: MP-SENSOR-01 now low stock
    │  └─ Alert: MP-MOTOR-A1 still out of stock
    ├─ Accountant: Invoice ready for payment
    └─ Customer: Service completion confirmed

11. Response to Manager:
    ├─ ✓ Deduction successful
    ├─ Parts deducted: 2
    ├─ New stock levels:
    │  ├─ MP-VENTO-BATT-001: 2 units
    │  ├─ MP-MOTOR-A1: 0 units (not deducted)
    │  └─ MP-SENSOR-01: 1 unit
    ├─ Total cost: ₫17,500,000
    ├─ Alerts: 1 created (MP-SENSOR-01)
    ├─ Audit log entry: Created
    └─ Status: COMPLETED ✓

RESULT: Service order completed, inventory deducted, audit trail recorded, alerts created
```

### 2.4 Low Stock Alert Workflow

```
SCENARIO: System automatically creates and manages low stock alerts

BACKGROUND PROCESS (Every 5 minutes):

1. FOR EACH PART IN DATABASE:
   
   IF current_stock < minimum_stock_level:
   ├─ Check if LOW_STOCK alert already exists (not acknowledged)
   │  └─ IF YES: Skip (don't create duplicate)
   │  └─ IF NO: Create new alert
   │
   ├─ Create stock_alerts entry:
   │  ├─ alert_type: LOW_STOCK
   │  ├─ current_stock: [actual value]
   │  ├─ threshold_value: minimum_stock_level
   │  ├─ severity: HIGH
   │  └─ is_acknowledged: false
   │
   ├─ Update part.status: 
   │  └─ If current_stock > 0: LOW_STOCK
   │
   └─ IF current_stock == 0:
      ├─ alert_type: OUT_OF_STOCK
      ├─ severity: CRITICAL
      ├─ part.status: OUT_OF_STOCK
      └─ Schedule urgent notification

2. Send notifications to ADMIN, BUSINESS_MANAGER:
   ├─ Email: "Stock Alert: MP-VENTO-BATT-001 (3/5)"
   ├─ Dashboard: Alert badge +1
   ├─ In-app notification: Red alert card
   └─ If CRITICAL: Also SMS alert

MANAGER RESPONSE:

3. Manager views dashboard:
   - Sees 3 alerts total
   - 1 CRITICAL (MP-MOTOR-A1 out of stock)
   - 2 HIGH (MP-VENTO-BATT-001, MP-SENSOR-01)

4. Manager takes action:
   
   Option A: Create Purchase Order
   ├─ Select part: MP-MOTOR-A1
   ├─ Select supplier: Supplier ABC (3 day lead time)
   ├─ Set quantity: 20 units (reorder_quantity)
   ├─ Add to PO
   ├─ Create PO
   └─ Expected delivery: 4 days from now
   
   Option B: Acknowledge Alert
   ├─ Select alerts: MP-VENTO-BATT-001, MP-SENSOR-01
   ├─ Click [Acknowledge]
   ├─ Update alerts:
   │  ├─ is_acknowledged: true
   │  ├─ acknowledged_by: [Manager ID]
   │  └─ acknowledged_at: NOW()
   ├─ Alerts move to "Acknowledged" section
   └─ Still visible but not flagged as new
   
   Option C: Find Alternative Part
   ├─ Select part: MP-MOTOR-A1
   ├─ Click [Find Alternative]
   ├─ System shows compatible parts:
   │  ├─ MP-MOTOR-A2: 5 in stock, ₫8.5M
   │  ├─ MP-MOTOR-B1: 3 in stock, ₫7.8M
   │  └─ MP-MOTOR-C1: 2 in stock, ₫9.2M
   ├─ Manager selects alternative
   └─ System logs recommendation

AUTOMATED FOLLOW-UP:

5. If no action taken for 24 hours:
   ├─ Send reminder email to manager
   ├─ Include suggested actions
   └─ Mark as "ESCALATED"

6. If out of stock for 7+ days:
   ├─ Send report to executive
   ├─ Include impact analysis:
   │  ├─ Services delayed: X
   │  ├─ Revenue impact: ₫Y
   │  └─ Customer complaints: Z
   └─ Suggest alternative suppliers

7. Once stock is replenished:
   ├─ Purchase order received: +20 units
   ├─ current_stock: 0 → 20
   ├─ part.status: OUT_OF_STOCK → ACTIVE
   ├─ Create inventory_history: PURCHASE
   ├─ Clear all alerts for this part
   ├─ Notification: "MP-MOTOR-A1 back in stock"
   └─ Alert system clears

RESULT: Automated monitoring, manager notification, action tracking, inventory replenishment
```

---

## 3. Testing Workflows

### 3.1 Unit Test Scenarios

```java
@RunWith(SpringRunner.class)
@DataJpaTest
public class SparePartsServiceTest {
    
    // TEST 1: Create Part Successfully
    @Test
    public void testCreatePartSuccessfully() {
        CreatePartRequest request = new CreatePartRequest();
        request.setPartCode("MP-TEST-001");
        request.setPartName("Test Part");
        // ... set other fields ...
        
        PartResponse response = sparePartsService.createPart(request);
        
        assertThat(response.getId()).isNotNull();
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getCurrentStock()).isEqualTo(0);
    }
    
    // TEST 2: Prevent Duplicate Part Code
    @Test(expected = DuplicatePartException.class)
    public void testCreateDuplicatePartCode() {
        CreatePartRequest request = new CreatePartRequest();
        request.setPartCode("MP-VENTO-BATT-001");
        // Attempt to create duplicate
        sparePartsService.createPart(request);
    }
    
    // TEST 3: Check Stock Availability - Sufficient
    @Test
    public void testCheckStockAvailable() {
        InventoryCheckResponse response = sparePartsService.checkInventory(1L, 2);
        
        assertThat(response.isAvailable()).isTrue();
        assertThat(response.getInsufficientBy()).isNull();
    }
    
    // TEST 4: Check Stock Availability - Insufficient
    @Test
    public void testCheckStockInsufficient() {
        InventoryCheckResponse response = sparePartsService.checkInventory(2L, 5);
        
        assertThat(response.isAvailable()).isFalse();
        assertThat(response.getInsufficientBy()).isEqualTo(5);
    }
    
    // TEST 5: Adjust Inventory - Valid
    @Test
    public void testAdjustInventoryValid() {
        AdjustInventoryRequest request = new AdjustInventoryRequest();
        request.setQuantityAdjustment(-2);
        request.setReason("DAMAGE");
        
        PartResponse response = sparePartsService.adjustInventory(1L, request);
        
        assertThat(response.getCurrentStock()).isEqualTo(5); // 7 - 2
        assertThat(response.getStatus()).isEqualTo("LOW_STOCK");
    }
    
    // TEST 6: Adjust Inventory - Negative Result
    @Test(expected = IllegalArgumentException.class)
    public void testAdjustInventoryNegative() {
        AdjustInventoryRequest request = new AdjustInventoryRequest();
        request.setQuantityAdjustment(-10); // Current is 7, would be -3
        
        sparePartsService.adjustInventory(1L, request);
    }
    
    // TEST 7: Deduct Inventory on Service
    @Test
    @Transactional
    public void testDeductInventoryOnServiceCompletion() {
        List<InventoryDeductionRequest> items = new ArrayList<>();
        items.add(new InventoryDeductionRequest(1L, 1)); // Part 1, qty 1
        
        InventoryDeductionResponse response = 
            sparePartsService.deductInventoryForService(1001L, items);
        
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getItemsProcessed()).isEqualTo(1);
        
        // Verify inventory history created
        List<InventoryHistory> history = 
            inventoryHistoryRepository.findByPartId(1L);
        assertThat(history).isNotEmpty();
        assertThat(history.get(0).getTransactionType()).isEqualTo("USAGE");
    }
    
    // TEST 8: Prevent Double Deduction
    @Test(expected = DuplicateDeductionException.class)
    public void testPreventDoubleDeduction() {
        // First deduction succeeds
        List<InventoryDeductionRequest> items = new ArrayList<>();
        items.add(new InventoryDeductionRequest(1L, 1));
        sparePartsService.deductInventoryForService(1001L, items);
        
        // Second deduction on same order fails
        sparePartsService.deductInventoryForService(1001L, items);
    }
    
    // TEST 9: Auto-Create Stock Alert
    @Test
    public void testAutoCreateLowStockAlert() {
        AdjustInventoryRequest request = new AdjustInventoryRequest();
        request.setQuantityAdjustment(-7); // Reduce to 0
        
        sparePartsService.adjustInventory(1L, request);
        
        // Verify alert created
        List<StockAlert> alerts = 
            alertRepository.findByPartIdAndAcknowledgedFalse(1L);
        assertThat(alerts).isNotEmpty();
        assertThat(alerts.get(0).getAlertType()).isEqualTo("OUT_OF_STOCK");
    }
    
    // TEST 10: Transactional Rollback
    @Test
    @Transactional
    public void testTransactionalRollbackOnError() {
        List<InventoryDeductionRequest> items = new ArrayList<>();
        items.add(new InventoryDeductionRequest(1L, 1)); // OK
        items.add(new InventoryDeductionRequest(2L, 100)); // Insufficient
        
        try {
            sparePartsService.deductInventoryForService(1001L, items);
            fail("Should have thrown exception");
        } catch (InsufficientInventoryException e) {
            // Verify Part 1 stock not changed (rolled back)
            Part part1 = partRepository.findById(1L).get();
            assertThat(part1.getCurrentStock()).isEqualTo(7); // Original
        }
    }
}
```

### 3.2 Integration Test Scenarios

```
SCENARIO 1: Complete Service Order Workflow
├─ Create service order
├─ Add parts to order
├─ Check stock availability
├─ Complete service
├─ Deduct inventory
├─ Verify history created
├─ Verify alerts created if needed
├─ Verify notifications sent
└─ RESULT: End-to-end process successful

SCENARIO 2: Concurrent Inventory Deductions
├─ Two services complete simultaneously
├─ Both try to deduct from same part (1 unit available)
├─ Only first request succeeds
├─ Second request fails with insufficient stock
├─ Both operations properly rolled back
└─ RESULT: Database consistency maintained

SCENARIO 3: Stock Replenishment Workflow
├─ Part is out of stock (0 units)
├─ Create purchase order
├─ Receive goods
├─ Adjust inventory (+20 units)
├─ Verify status changed from OUT_OF_STOCK to ACTIVE
├─ Verify alert cleared
├─ Verify history recorded
└─ RESULT: Stock replenishment complete

SCENARIO 4: Error Handling & Recovery
├─ Attempt deduction with insufficient stock
├─ Receive 400 error
├─ Manager resolves issue (waits for restock)
├─ Retry deduction
├─ RESULT: Successful retry after resolution
```

---

## 4. Deployment Checklist

- [ ] Database schema created with all tables
- [ ] Indexes created for performance
- [ ] Sample data loaded for testing
- [ ] Application startup tests passed
- [ ] All endpoints tested with Swagger UI
- [ ] JWT authentication verified
- [ ] Role-based access control tested
- [ ] Error handling tested with various edge cases
- [ ] Transactional integrity verified
- [ ] Audit logging verified
- [ ] Stock alert system tested
- [ ] Performance tests passed (response time < 500ms)
- [ ] Load testing passed (1000+ concurrent requests)
- [ ] Security scan passed (OWASP compliance)
- [ ] Documentation complete
- [ ] Team trained on module features
- [ ] Backup strategy confirmed
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

