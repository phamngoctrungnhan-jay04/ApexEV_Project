package com.apexev.controller.coreBussinessController;

import com.apexev.entity.MaintenanceService;
import com.apexev.service.service_Interface.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/services") // Endpoint FE gọi
public class ServiceController {

    private final ServiceService serviceService;

    // GET http://localhost:8081/api/services
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<MaintenanceService>> getAllServices() {
        List<MaintenanceService> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    // POST http://localhost:8081/api/services
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaintenanceService> createService(@RequestBody MaintenanceService service) {
        MaintenanceService createdService = serviceService.createService(service);
        return ResponseEntity.ok(createdService);
    }

    // PUT http://localhost:8081/api/services/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaintenanceService> updateService(
            @PathVariable Long id,
            @RequestBody MaintenanceService service) {
        MaintenanceService updatedService = serviceService.updateService(id, service);
        return ResponseEntity.ok(updatedService);
    }

    // DELETE http://localhost:8081/api/services/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}