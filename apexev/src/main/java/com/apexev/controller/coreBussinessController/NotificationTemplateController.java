package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.supportAndSystem.NotificationTemplateRequest;
import com.apexev.dto.response.supportAndSystem.NotificationTemplateResponse;
import com.apexev.service.service_Interface.NotificationTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-templates")
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateService notificationTemplateService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> create(@Valid @RequestBody NotificationTemplateRequest request) {
        return ResponseEntity.ok(notificationTemplateService.create(request));
    }
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationTemplateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationTemplateService.getById(id));
    }
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationTemplateResponse>> getAll() {
        return ResponseEntity.ok(notificationTemplateService.getAll());
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> update(@PathVariable Long id, @Valid @RequestBody NotificationTemplateRequest request) {
        return ResponseEntity.ok(notificationTemplateService.update(id, request));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationTemplateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
