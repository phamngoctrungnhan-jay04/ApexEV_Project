package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.maintenance.ChecklistTemplateRequest;
import com.apexev.dto.response.maintenance.ChecklistTemplateResponse;
import com.apexev.service.service_Interface.ChecklistTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist-templates")
@RequiredArgsConstructor
public class ChecklistTemplateController {

    private final ChecklistTemplateService checklistTemplateService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ChecklistTemplateResponse> createTemplate(@Valid @RequestBody ChecklistTemplateRequest request) {
        return ResponseEntity.ok(checklistTemplateService.createTemplate(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChecklistTemplateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(checklistTemplateService.getTemplateById(id));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChecklistTemplateResponse>> getAll() {
        return ResponseEntity.ok(checklistTemplateService.getAllTemplates());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ChecklistTemplateResponse> update(@PathVariable Long id, @Valid @RequestBody ChecklistTemplateRequest request) {
        return ResponseEntity.ok(checklistTemplateService.updateTemplate(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        checklistTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
