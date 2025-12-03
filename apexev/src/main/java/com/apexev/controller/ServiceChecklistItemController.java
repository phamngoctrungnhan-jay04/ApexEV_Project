package com.apexev.controller;

import com.apexev.dto.response.ServiceChecklistItemResponse;
import com.apexev.service.ServiceChecklistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-checklist-items")
@CrossOrigin(origins = "*")
public class ServiceChecklistItemController {
    
    @Autowired
    private ServiceChecklistItemService checklistItemService;
    
    /**
     * Lấy tất cả checklist items theo service ID
     * GET /api/service-checklist-items/service/{serviceId}
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getChecklistItemsByServiceId(@PathVariable Long serviceId) {
        try {
            List<ServiceChecklistItemResponse> items = checklistItemService.getChecklistItemsByServiceId(serviceId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy danh sách checklist items: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Lấy checklist items đang active theo service ID
     * GET /api/service-checklist-items/service/{serviceId}/active
     */
    @GetMapping("/service/{serviceId}/active")
    public ResponseEntity<?> getActiveChecklistItemsByServiceId(@PathVariable Long serviceId) {
        try {
            List<ServiceChecklistItemResponse> items = checklistItemService.getActiveChecklistItemsByServiceId(serviceId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy danh sách checklist items active: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Lấy checklist items theo service ID và category
     * GET /api/service-checklist-items/service/{serviceId}/category/{category}
     */
    @GetMapping("/service/{serviceId}/category/{category}")
    public ResponseEntity<?> getChecklistItemsByCategory(
            @PathVariable Long serviceId,
            @PathVariable String category) {
        try {
            List<ServiceChecklistItemResponse> items = checklistItemService.getChecklistItemsByServiceIdAndCategory(serviceId, category);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy danh sách checklist items theo category: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Đếm số checklist items của một service
     * GET /api/service-checklist-items/service/{serviceId}/count
     */
    @GetMapping("/service/{serviceId}/count")
    public ResponseEntity<?> countChecklistItems(@PathVariable Long serviceId) {
        try {
            Long count = checklistItemService.countChecklistItemsByServiceId(serviceId);
            Map<String, Object> result = new HashMap<>();
            result.put("serviceId", serviceId);
            result.put("totalItems", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể đếm checklist items: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Kiểm tra service có checklist items không
     * GET /api/service-checklist-items/service/{serviceId}/exists
     */
    @GetMapping("/service/{serviceId}/exists")
    public ResponseEntity<?> hasChecklistItems(@PathVariable Long serviceId) {
        try {
            boolean exists = checklistItemService.hasChecklistItems(serviceId);
            Map<String, Object> result = new HashMap<>();
            result.put("serviceId", serviceId);
            result.put("hasChecklistItems", exists);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể kiểm tra checklist items: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
