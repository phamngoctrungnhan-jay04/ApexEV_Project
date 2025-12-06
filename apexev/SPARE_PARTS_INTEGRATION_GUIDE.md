# Spare Parts Module - Integration Guide 🔗

**Module**: Spare Parts Management  
**Purpose**: Complete integration guide with ApexEV system  
**Last Updated**: December 1, 2025

---

## 📊 System Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ApexEV System                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Appointment  │  │ Service      │  │ Spare Parts  │             │
│  │ Management   │  │ Order        │  │ Management   │  ◄─ NEW    │
│  │ Module       │  │ Module       │  │ Module       │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│         │                   ▲                  ▲                    │
│         │                   │ Uses             │                    │
│         └───────────────────┼──────────────────┘                    │
│                             │                                       │
│  ┌──────────────┐  ┌────────┴───────┐  ┌──────────────┐            │
│  │ User & Role  │  │ Inventory      │  │ HR & Shift   │            │
│  │ Management   │  │ Tracking       │  │ Management   │            │
│  └──────────────┘  └────────────────┘  └──────────────┘            │
│         │                                                            │
│  ┌──────┴──────────────────────────────────────────────────┐        │
│  │  Database (MySQL)                                        │        │
│  │  - users, roles, permissions                            │        │
│  │  - service_orders, service_order_items                  │        │
│  │  - parts (NEW), inventory_history (NEW)                 │        │
│  │  - appointments, maintenance_services                   │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                     │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  Security Layer (JWT + Role-Based Access)               │        │
│  │  - Token validation                                     │        │
│  │  - Permission checks                                    │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Integration: Service Order → Parts Usage

### Complete Workflow

```
1. Khách hàng đặt lịch bảo dưỡng
   ↓
2. Advisor tạo Service Order
   ↓
3. Technician kiểm tra phụ tùng cần thay
   ↓
4. CHECK INVENTORY ◄──────────── Spare Parts Module
   - Kiểm tra tồn kho có đủ không?
   ├─ ✅ Đủ: Tiếp tục
   └─ ❌ Không đủ: Hiển thị cảnh báo
   ↓
5. Technician thay phụ tùng, ghi nhận sử dụng
   ↓
6. APPLY TO SERVICE ORDER ◄───── Spare Parts Module
   - Tự động trừ tồn kho
   - Ghi log sử dụng
   - Cập nhật trạng thái phụ tùng
   ↓
7. Hệ thống tự động kiểm tra low-stock
   ↓
8. Nếu tồn kho thấp: Tạo alert cho manager
   ↓
9. Manager xem danh sách phụ tùng cần nhập
   ↓
10. ADJUST INVENTORY ◄───────────── Spare Parts Module
    - Nhập hàng mới
    - Cập nhật số lượng
    ↓
11. Status tự động cập nhật: OUT_OF_STOCK → ACTIVE
```

---

## 🔗 Integration Points

### 1. **Service Order Integration**

**File**: `src/main/java/com/apexev/entity/ServiceOrder.java`

**Integration Method**: When service order is completed, call:
```java
// In ServiceOrderServiceImpl or controller
@PostMapping("/complete/{orderId}")
public ResponseEntity<?> completeServiceOrder(
    @PathVariable Long orderId,
    @RequestBody ServiceCompletionRequest request
) {
    // 1. Get service order
    ServiceOrder order = serviceOrderRepository.findById(orderId);
    
    // 2. Call Spare Parts Service to apply parts
    List<InventoryDeductionRequest> partUsage = 
        request.getPartsUsed(); // Convert from request
    
    sparePartsService.deductInventoryForService(
        orderId, 
        partUsage
    );
    
    // 3. Mark service order as completed
    order.setStatus(OrderStatus.COMPLETED);
    serviceOrderRepository.save(order);
    
    return ResponseEntity.ok("Service completed and parts deducted");
}
```

### 2. **Service Order Item Integration**

**File**: `src/main/java/com/apexev/entity/ServiceOrderItem.java`

**Current Structure**:
```java
@Entity
@Table(name = "service_order_items")
public class ServiceOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "service_order_id")
    private ServiceOrder serviceOrder;
    
    @ManyToOne
    @JoinColumn(name = "service_id")
    private MaintenanceService service;
    
    private BigDecimal cost;
    private Integer status;
    
    // Could be extended to include:
    // @ManyToOne
    // @JoinColumn(name = "part_id")
    // private Part part;
    //
    // private Integer quantityUsed;
}
```

**Enhancement Needed** (if you want direct part tracking):
```java
@ManyToOne
@JoinColumn(name = "part_id", nullable = true)
private Part part; // Reference to spare part (optional)

private Integer quantityUsed; // Quantity of this part used
```

### 3. **Maintenance Service Integration**

**File**: `src/main/java/com/apexev/entity/MaintenanceService.java`

**Integration Point**:
```java
@Entity
public class MaintenanceService {
    // ... existing fields ...
    
    @ManyToMany
    @JoinTable(
        name = "maintenance_service_parts",
        joinColumns = @JoinColumn(name = "service_id"),
        inverseJoinColumns = @JoinColumn(name = "part_id")
    )
    private Set<Part> requiredParts; // Parts needed for this service
    
    @Column
    private Boolean requiresPartReplacement = false; // Does service need parts?
}
```

---

## 📊 Data Flow: Detailed Example

### Scenario: Replace Engine Oil and Filter

```
Step 1: Service Order Created
┌─────────────────────────────────┐
│ Service Order                   │
│ ID: 1001                        │
│ Vehicle: Vento 2024             │
│ Customer: Nguyễn Văn A          │
│ Services: Oil Change + Filter   │
└─────────────────────────────────┘

Step 2: Check Parts Availability
┌─────────────────────────────────────────────────────────┐
│ POST /api/spare-parts/check-inventory-batch             │
│                                                         │
│ Request:                                                │
│ [                                                       │
│   { "partId": 5, "requiredQuantity": 4 },    // Oil    │
│   { "partId": 8, "requiredQuantity": 1 }     // Filter │
│ ]                                                       │
│                                                         │
│ Response:                                               │
│ [                                                       │
│   {                                                     │
│     "partId": 5,                                        │
│     "partName": "Dầu máy Mobil 5W-30",                  │
│     "available": true,                                  │
│     "currentQuantity": 20                               │
│   },                                                    │
│   {                                                     │
│     "partId": 8,                                        │
│     "partName": "Lọc dầu Toyota",                       │
│     "available": true,                                  │
│     "currentQuantity": 15                               │
│   }                                                     │
│ ]                                                       │
└─────────────────────────────────────────────────────────┘

Step 3: Technician Uses Parts
┌─────────────────────────────────┐
│ Technician performs:            │
│ - Removes old oil (4L)          │
│ - Installs new oil filter       │
│ - Adds new oil (4L)             │
└─────────────────────────────────┘

Step 4: Apply Parts to Service Order
┌──────────────────────────────────────────────────────┐
│ POST /api/spare-parts/apply-to-service-order        │
│                                                      │
│ Request:                                             │
│ {                                                    │
│   "serviceOrderId": 1001,                           │
│   "items": [                                         │
│     {                                                │
│       "partId": 5,                                   │
│       "quantityUsed": 4,                             │
│       "costIncurred": 240000.00   // 60k per unit   │
│     },                                               │
│     {                                                │
│       "partId": 8,                                   │
│       "quantityUsed": 1,                             │
│       "costIncurred": 85000.00                       │
│     }                                                │
│   ]                                                  │
│ }                                                    │
│                                                      │
│ Response:                                            │
│ {                                                    │
│   "message": "Parts deducted successfully",          │
│   "totalCost": 325000.00,                            │
│   "parts": [                                         │
│     {                                                │
│       "id": 5,                                       │
│       "partName": "Dầu máy Mobil 5W-30",            │
│       "quantityInStock": 16,     // was 20, now 16  │
│       "status": "ACTIVE"                             │
│     },                                               │
│     {                                                │
│       "id": 8,                                       │
│       "partName": "Lọc dầu Toyota",                 │
│       "quantityInStock": 14,     // was 15, now 14  │
│       "status": "ACTIVE"                             │
│     }                                                │
│   ]                                                  │
│ }                                                    │
└──────────────────────────────────────────────────────┘

Step 5: System Auto-Checks Low Stock
┌──────────────────────────────────────────────────────┐
│ Background Process Checks:                           │
│ Part 5: quantityInStock(16) < threshold(10)? NO      │
│ Part 8: quantityInStock(14) < threshold(10)? NO      │
│ Result: No alert needed                              │
└──────────────────────────────────────────────────────┘

Step 6: Inventory History Logged
┌──────────────────────────────────────────────────────┐
│ inventory_history table entry:                        │
│ - part_id: 5                                          │
│ - old_quantity: 20                                   │
│ - new_quantity: 16                                   │
│ - change_type: USAGE                                 │
│ - service_order_id: 1001                             │
│ - user_id: 15 (Technician)                           │
│ - timestamp: 2025-12-01 14:30:00                     │
│ - notes: "Oil change for Vento 2024"                 │
└──────────────────────────────────────────────────────┘
```

---

## 🔌 API Integration Code Examples

### Example 1: Check Parts Before Service

```java
// In ServiceAdvisorController or ServiceOrderController
@PostMapping("/{orderId}/check-parts")
@PreAuthorize("hasRole('SERVICE_ADVISOR')")
public ResponseEntity<?> checkServiceParts(
    @PathVariable Long orderId
) {
    // Get service order
    ServiceOrder order = serviceOrderRepository.findById(orderId)
        .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    
    // Get service order items
    List<ServiceOrderItem> items = order.getItems();
    
    // Build inventory check requests
    List<CheckInventoryRequest> checks = items.stream()
        .map(item -> new CheckInventoryRequest(
            item.getPartId(),
            item.getQuantityNeeded()
        ))
        .collect(Collectors.toList());
    
    // Call Spare Parts Service
    List<InventoryCheckResponse> results = 
        sparePartsService.checkInventoryBatch(checks);
    
    // Check if any part is unavailable
    boolean allAvailable = results.stream()
        .allMatch(InventoryCheckResponse::isAvailable);
    
    return ResponseEntity.ok(new PartAvailabilityResponse(
        orderId,
        allAvailable,
        results
    ));
}
```

### Example 2: Auto-Deduct Parts on Service Completion

```java
// In ServiceOrderServiceImpl
@Override
@Transactional
public void completeServiceOrder(Long orderId, 
    ServiceCompletionRequest request) {
    
    // 1. Get service order
    ServiceOrder order = findOrderOrThrow(orderId);
    
    // 2. Prepare inventory deductions
    List<InventoryDeductionRequest> deductions = 
        request.getPartsUsed().stream()
            .map(partUsage -> new InventoryDeductionRequest(
                partUsage.getPartId(),
                partUsage.getQuantityUsed(),
                partUsage.getCost(),
                "Service Order #" + orderId
            ))
            .collect(Collectors.toList());
    
    // 3. Apply deductions
    try {
        InventoryDeductionResponse deductionResult = 
            sparePartsService.deductInventoryForService(
                orderId, 
                deductions
            );
        
        // 4. Update service order
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setTotalPartsCost(deductionResult.getTotalCost());
        
        serviceOrderRepository.save(order);
        
        // 5. Send notification
        notificationService.sendOrderCompletedNotification(order);
        
    } catch (InsufficientInventoryException e) {
        // Handle insufficient inventory
        throw new ServiceOrderProcessingException(
            "Cannot complete order: " + e.getMessage()
        );
    }
}
```

### Example 3: Low Stock Notification Workflow

```java
// Scheduled task to check low stock
@Component
public class LowStockAlertScheduler {
    
    @Autowired
    private SparePartsService sparePartsService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Scheduled(fixedRate = 3600000) // Every hour
    public void checkAndAlertLowStock() {
        int threshold = 10; // Configurable
        
        List<PartResponse> lowStockParts = 
            sparePartsService.getLowStockParts(threshold);
        
        if (!lowStockParts.isEmpty()) {
            // Create notification for managers
            String subject = "Cảnh báo: " + lowStockParts.size() + 
                " phụ tùng sắp hết hàng";
            
            String message = lowStockParts.stream()
                .map(p -> p.getPartName() + " (tồn: " + 
                    p.getQuantityInStock() + ")")
                .collect(Collectors.joining("\n"));
            
            notificationService.notifyManagers(
                subject, 
                message,
                "LOW_STOCK_ALERT"
            );
        }
    }
}
```

---

## 🗃️ Database Schema Relationships

### Current Tables
```
users ←─────────────┐
  │                 │
  └─ roles          │
                    │
appointments ───────┤
  │                 │
  ├─ service_orders │
  │    │             │
  │    └─ service_order_items
  │
  └─ vehicles


NEW:
parts
  │
  ├─ inventory_history (log all changes)
  │
  └─ [integrated with service_order_items]
```

### Proposed Enhancement

If you want complete integration, enhance `service_order_items`:

```sql
ALTER TABLE service_order_items 
ADD COLUMN part_id BIGINT,
ADD COLUMN quantity_used INT,
ADD FOREIGN KEY (part_id) REFERENCES parts(part_id);

-- This allows tracking exactly which parts were used in each service
```

---

## 🔄 Transaction Flow: Concurrent Safety

```
Service Completion with Multiple Parts
│
├─ Transaction Start (SERIALIZABLE isolation)
│
├─ Step 1: Lock relevant parts
│  └─ SELECT ... FROM parts WHERE id IN (...) FOR UPDATE
│
├─ Step 2: Validate all parts
│  ├─ Part exists?
│  ├─ Part not DISCONTINUED?
│  └─ Sufficient quantity for each part?
│
├─ Step 3: Deduct all parts (atomic)
│  ├─ Update parts[0]: quantity -= used[0]
│  ├─ Update parts[1]: quantity -= used[1]
│  ├─ Update parts[n]: quantity -= used[n]
│  └─ Create inventory_history entries
│
├─ Step 4: Auto-update status
│  ├─ If quantity = 0: status = OUT_OF_STOCK
│  └─ If quantity < threshold: Create alert
│
├─ Step 5: Update service order
│  └─ Update service_orders SET status = COMPLETED
│
├─ Step 6: Commit Transaction
│  └─ All changes atomic - all or nothing
│
└─ End
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Integration (This Week)
- [x] Spare Parts Module implemented
- [ ] Add part_id to service_order_items (optional)
- [ ] Add check-inventory before service completion
- [ ] Add apply-parts-to-service-order endpoint usage

### Phase 2: Workflow Integration (Next Week)
- [ ] Implement ServiceOrderServiceImpl integration
- [ ] Add low-stock alert scheduler
- [ ] Add inventory history tracking
- [ ] Update service completion workflow

### Phase 3: Advanced Features (Sprint 2)
- [ ] Add parts forecasting
- [ ] Add supplier integration
- [ ] Add purchase order automation
- [ ] Add analytics dashboard

---

## 🧪 Integration Testing

### Test Case 1: Basic CRUD + Check
```java
@Test
public void testCreatePartAndCheckInventory() {
    // Create part
    CreatePartRequest request = new CreatePartRequest();
    request.setPartName("Test Part");
    request.setSku("TEST-PART-001");
    request.setQuantityInStock(50);
    request.setPrice(BigDecimal.valueOf(100000));
    
    PartResponse created = sparePartsService.createPart(request);
    assertNotNull(created.getId());
    
    // Check inventory
    CheckInventoryRequest check = new CheckInventoryRequest();
    check.setPartId(created.getId());
    check.setRequiredQuantity(30);
    
    InventoryCheckResponse checkResult = 
        sparePartsService.checkInventory(check);
    
    assertTrue(checkResult.isAvailable());
    assertNull(checkResult.getInsufficientBy());
}
```

### Test Case 2: Inventory Deduction
```java
@Test
public void testDeductInventoryForService() {
    // Create part with initial stock
    Part part = createTestPart(100);
    
    // Create service order
    Long serviceOrderId = 500L;
    
    // Deduct parts
    List<InventoryDeductionRequest> deductions = 
        Arrays.asList(
            new InventoryDeductionRequest(
                part.getId(), 25, 
                BigDecimal.valueOf(2500000), 
                "Test deduction"
            )
        );
    
    InventoryDeductionResponse response = 
        sparePartsService.deductInventoryForService(
            serviceOrderId, 
            deductions
        );
    
    // Verify
    Part updated = partRepository.findById(part.getId()).get();
    assertEquals(75, updated.getQuantityInStock());
}
```

---

## 📞 Support & Troubleshooting

### Common Integration Issues

**Issue**: "Parts not deducted when service completed"  
**Solution**: 
- Ensure `apply-to-service-order` endpoint is called
- Verify service order status is set to COMPLETED
- Check that parts exist and are ACTIVE status

**Issue**: "Low stock alerts not firing"  
**Solution**:
- Verify scheduler is running
- Check threshold value (default 10)
- Ensure notification service is configured

**Issue**: "Concurrent deductions causing conflicts"  
**Solution**:
- Uses SERIALIZABLE isolation automatically
- If issues persist, increase database connection pool
- Monitor transaction logs

---

## 🔗 Related Documentation

- **Main Module**: SPARE_PARTS_TECHNICAL_SPEC.md
- **Quick Reference**: SPARE_PARTS_QUICK_REFERENCE.md
- **Status**: SPARE_PARTS_STATUS_VERIFICATION.md
- **Deployment**: SPARE_PARTS_DEPLOYMENT_GUIDE.md

---

**Version**: 1.0  
**Status**: Production Ready ✅  
**Integration Level**: Ready for Phase 1 implementation

