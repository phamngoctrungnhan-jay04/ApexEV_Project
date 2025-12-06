package com.apexev.controller.coreBussinessController;

import com.apexev.entity.Part;
import com.apexev.repository.coreBussiness.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý phụ tùng (Parts Management)
 * CRUD API cho Admin
 * Note: GET all và search đã có trong PartRequestController
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parts/admin")
public class PartController {

    private final PartRepository partRepository;

    /**
     * GET /api/parts/admin/all - Lấy tất cả phụ tùng (với entity đầy đủ cho Admin)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Part>> getAllPartsForAdmin() {
        List<Part> parts = partRepository.findAll();
        return ResponseEntity.ok(parts);
    }

    /**
     * GET /api/parts/admin/{id} - Lấy phụ tùng theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Part> getPartById(@PathVariable Long id) {
        return partRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/parts/admin - Tạo phụ tùng mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPart(@RequestBody Part part) {
        try {
            // Validate required fields
            if (part.getPartName() == null || part.getPartName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên phụ tùng là bắt buộc");
            }
            if (part.getPrice() == null) {
                return ResponseEntity.badRequest().body("Giá phụ tùng là bắt buộc");
            }

            // Check SKU uniqueness
            if (part.getSku() != null && !part.getSku().trim().isEmpty()) {
                if (partRepository.findBySku(part.getSku()).isPresent()) {
                    return ResponseEntity.badRequest().body("Mã SKU đã tồn tại: " + part.getSku());
                }
            }

            // Set default quantity if not provided
            if (part.getQuantityInStock() < 0) {
                part.setQuantityInStock(0);
            }

            Part savedPart = partRepository.save(part);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo phụ tùng: " + e.getMessage());
        }
    }

    /**
     * PUT /api/parts/admin/{id} - Cập nhật phụ tùng
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePart(@PathVariable Long id, @RequestBody Part partDetails) {
        try {
            return partRepository.findById(id)
                    .map(existingPart -> {
                        // Validate required fields
                        if (partDetails.getPartName() == null || partDetails.getPartName().trim().isEmpty()) {
                            return ResponseEntity.badRequest().body("Tên phụ tùng là bắt buộc");
                        }
                        if (partDetails.getPrice() == null) {
                            return ResponseEntity.badRequest().body("Giá phụ tùng là bắt buộc");
                        }

                        // Check SKU uniqueness (exclude current part)
                        if (partDetails.getSku() != null && !partDetails.getSku().trim().isEmpty()) {
                            var existingSku = partRepository.findBySku(partDetails.getSku());
                            if (existingSku.isPresent() && !existingSku.get().getId().equals(id)) {
                                return ResponseEntity.badRequest().body("Mã SKU đã tồn tại: " + partDetails.getSku());
                            }
                        }

                        // Update fields
                        existingPart.setPartName(partDetails.getPartName());
                        existingPart.setSku(partDetails.getSku());
                        existingPart.setDescription(partDetails.getDescription());
                        existingPart.setQuantityInStock(partDetails.getQuantityInStock());
                        existingPart.setPrice(partDetails.getPrice());

                        Part updatedPart = partRepository.save(existingPart);
                        return ResponseEntity.ok(updatedPart);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật phụ tùng: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/parts/admin/{id} - Xóa phụ tùng
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePart(@PathVariable Long id) {
        try {
            return partRepository.findById(id)
                    .map(part -> {
                        partRepository.delete(part);
                        return ResponseEntity.ok("Đã xóa phụ tùng: " + part.getPartName());
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa phụ tùng: " + e.getMessage());
        }
    }

    /**
     * PATCH /api/parts/admin/{id}/stock - Cập nhật số lượng tồn kho
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam int quantity,
            @RequestParam(defaultValue = "add") String action) {
        try {
            return partRepository.findById(id)
                    .map(part -> {
                        int currentStock = part.getQuantityInStock();
                        int newStock;

                        if ("add".equalsIgnoreCase(action)) {
                            newStock = currentStock + quantity;
                        } else if ("subtract".equalsIgnoreCase(action)) {
                            newStock = currentStock - quantity;
                            if (newStock < 0) {
                                return ResponseEntity.badRequest()
                                        .body("Không đủ tồn kho! Hiện có: " + currentStock);
                            }
                        } else if ("set".equalsIgnoreCase(action)) {
                            newStock = quantity;
                        } else {
                            return ResponseEntity.badRequest().body("Action không hợp lệ: " + action);
                        }

                        part.setQuantityInStock(newStock);
                        Part savedPart = partRepository.save(part);
                        return ResponseEntity.ok(savedPart);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật tồn kho: " + e.getMessage());
        }
    }
}
