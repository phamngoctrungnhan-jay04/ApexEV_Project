package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.coreBussinessRequest.AdjustInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CheckInventoryRequest;
import com.apexev.dto.request.coreBussinessRequest.CreatePartRequest;
import com.apexev.dto.request.coreBussinessRequest.UpdatePartRequest;
import com.apexev.dto.response.coreBussinessResponse.InventoryCheckResponse;
import com.apexev.dto.response.coreBussinessResponse.PartResponse;
import com.apexev.dto.request.coreBussinessRequest.UsePartRequest;
import com.apexev.dto.response.coreBussinessResponse.UsePartResponse;
import com.apexev.enums.PartStatus;
import com.apexev.service.service_Interface.SparePartsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spare-parts")
@RequiredArgsConstructor
public class SparePartsController {
    
    private final SparePartsService sparePartsService;
    
    // ========== CREATE Operations ==========
    
  
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")
    //   Tạo mới phụ tùng vào kho. Chỉ ADMIN hoặc Quản lý kho được phép.
    
    public ResponseEntity<PartResponse> createPart(
            @Valid @RequestBody CreatePartRequest request
    ) {
        PartResponse newPart = sparePartsService.createPart(request);
        return new ResponseEntity<>(newPart, HttpStatus.CREATED);
    }
    

    
   
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    //  Lấy thông tin chi tiết phụ tùng theo ID. Tất cả người dùng đã xác thực đều xem được.
    public ResponseEntity<PartResponse> getPartById(
            @PathVariable("id") Long partId
    ) {
        PartResponse part = sparePartsService.getPartById(partId);
        return ResponseEntity.ok(part);
    }

    @GetMapping("/sku/{sku}")
    @PreAuthorize("isAuthenticated()")
    //  Lấy thông tin phụ tùng theo mã SKU. Tất cả người dùng đã xác thực đều xem được.
    public ResponseEntity<PartResponse> getPartBySku(
            @PathVariable("sku") String sku
    ) {
        PartResponse part = sparePartsService.getPartBySku(sku);
        return ResponseEntity.ok(part);
    }
    

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    //  Lấy danh sách tất cả phụ tùng trong kho. Tất cả người dùng đã xác thực đều xem được.
    public ResponseEntity<List<PartResponse>> getAllParts() {
        List<PartResponse> parts = sparePartsService.getAllParts();
        return ResponseEntity.ok(parts);
    }
    
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")

    // Lấy danh sách phụ tùng đang hoạt động (ACTIVE). Tất cả người dùng đã xác thực đều xem được.

    public ResponseEntity<List<PartResponse>> getActiveParts() {
        List<PartResponse> parts = sparePartsService.getActiveParts();
        return ResponseEntity.ok(parts);
    }
    

    @GetMapping("/inventory/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER', 'SERVICE_ADVISOR')")

    // Lấy danh sách phụ tùng sắp hết hàng (tồn kho dưới ngưỡng cảnh báo). Chỉ ADMIN, Quản lý kho, Cố vấn dịch vụ được xem.
   
    public ResponseEntity<List<PartResponse>> getLowStockParts(
            @RequestParam(value = "threshold", defaultValue = "10") Integer threshold
    ) {
        List<PartResponse> parts = sparePartsService.getLowStockParts(threshold);
        return ResponseEntity.ok(parts);
    }
    

    @GetMapping("/inventory/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")

    // Lấy danh sách phụ tùng đã hết hàng. Chỉ ADMIN, Quản lý kho được xem.
    public ResponseEntity<List<PartResponse>> getOutOfStockParts() {
        List<PartResponse> parts = sparePartsService.getOutOfStockParts();
        return ResponseEntity.ok(parts);
    }
 
    @GetMapping("/search/name")
    @PreAuthorize("isAuthenticated()")

//   Tìm kiếm phụ tùng theo tên (có thể tìm gần đúng, không phân biệt hoa thường).
 
    public ResponseEntity<List<PartResponse>> searchPartsByName(
            @RequestParam("query") String partName
    ) {
        List<PartResponse> parts = sparePartsService.searchPartsByName(partName);
        return ResponseEntity.ok(parts);
    }
    

    @GetMapping("/search/sku")
    @PreAuthorize("isAuthenticated()")

//  Tìm kiếm phụ tùng theo mã SKU (tìm gần đúng, không phân biệt hoa thường).
   
    public ResponseEntity<List<PartResponse>> searchPartsBySku(
            @RequestParam("query") String sku
    ) {
        List<PartResponse> parts = sparePartsService.searchPartsBySku(sku);
        return ResponseEntity.ok(parts);
    }
    

    @GetMapping("/inventory/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")

//   Lấy báo cáo tổng hợp tồn kho. Chỉ ADMIN, Quản lý kho được xem.

    public ResponseEntity<List<PartResponse>> getInventoryReport() {
        List<PartResponse> parts = sparePartsService.getInventoryReport();
        return ResponseEntity.ok(parts);
    }
    
    // ========== UPDATE Operations ==========
    

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")
    //   Cập nhật thông tin phụ tùng. Chỉ ADMIN hoặc Quản lý kho được phép.
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable("id") Long partId,
            @Valid @RequestBody UpdatePartRequest request
    ) {
        PartResponse updatedPart = sparePartsService.updatePart(partId, request);
        return ResponseEntity.ok(updatedPart);
    }
    
 
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER')")

//  Đổi trạng thái hoạt động của phụ tùng (ACTIVE, INACTIVE, ...). Chỉ ADMIN hoặc Quản lý kho được phép.
    
    public ResponseEntity<PartResponse> changePartStatus(
            @PathVariable("id") Long partId,
            @RequestParam("status") PartStatus status
    ) {
        PartResponse updatedPart = sparePartsService.changePartStatus(partId, status);
        return ResponseEntity.ok(updatedPart);
    }
    
  
    @PatchMapping("/{id}/inventory/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS_MANAGER', 'TECHNICIAN')")

    // Điều chỉnh số lượng tồn kho (cộng/trừ). ADMIN, Quản lý kho, Kỹ thuật viên đều có thể thao tác.
  
    public ResponseEntity<PartResponse> adjustInventory(
            @PathVariable("id") Long partId,
            @Valid @RequestBody AdjustInventoryRequest request
    ) {
        PartResponse updatedPart = sparePartsService.adjustInventory(partId, request);
        return ResponseEntity.ok(updatedPart);
    }
    
    // ========== DELETE Operations ==========
    
   
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")

//  Xóa mềm phụ tùng (chuyển trạng thái DISCONTINUED, không xóa vật lý). Chỉ ADMIN được phép.

    public ResponseEntity<Void> deletePart(
            @PathVariable("id") Long partId
    ) {
        sparePartsService.deletePart(partId);
        return ResponseEntity.noContent().build();
    }
    
    // ========== INVENTORY Check Operations ==========
   
    @PostMapping("/inventory/check")
    @PreAuthorize("isAuthenticated()")

//  Kiểm tra tồn kho cho 1 phụ tùng (theo SKU hoặc ID). Tất cả người dùng đã xác thực đều kiểm tra được.

    public ResponseEntity<InventoryCheckResponse> checkInventory(
            @Valid @RequestBody CheckInventoryRequest request
    ) {
        InventoryCheckResponse response = sparePartsService.checkInventory(request);
        return ResponseEntity.ok(response);
    }
    

    @PostMapping("/inventory/check-batch")
    @PreAuthorize("isAuthenticated()")
//  Kiểm tra tồn kho cho nhiều phụ tùng (batch). Tất cả người dùng đã xác thực đều kiểm tra được.
    public ResponseEntity<List<InventoryCheckResponse>> checkInventoryBatch(
            @Valid @RequestBody List<CheckInventoryRequest> requests
    ) {
        List<InventoryCheckResponse> responses = sparePartsService.checkInventoryBatch(requests);
        return ResponseEntity.ok(responses);
    }

        /**
         * [VI] Dùng phụ tùng cho một Service Order Item: trừ kho và ghi nhận hành động.
         * Roles: TECHNICIAN, SERVICE_ADVISOR, ADMIN, BUSINESS_MANAGER
         */
        @PostMapping("/use")
        @PreAuthorize("hasAnyRole('TECHNICIAN','SERVICE_ADVISOR','ADMIN','BUSINESS_MANAGER')")
        public ResponseEntity<UsePartResponse> usePart(
                @Valid @RequestBody UsePartRequest request
        ) {
            UsePartResponse resp = sparePartsService.usePart(request);
            return ResponseEntity.ok(resp);
        }
}
