package com.apexev.controller.coreBussinessController;

import com.apexev.entity.MaintenanceService;
import com.apexev.service.service_Interface.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/services") // Endpoint FE gọi
public class ServiceController {

    private final ServiceService serviceService;

    // GET http://localhost:8081/api/services
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<MaintenanceService>> getAllServices() {
        List<MaintenanceService> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }
}