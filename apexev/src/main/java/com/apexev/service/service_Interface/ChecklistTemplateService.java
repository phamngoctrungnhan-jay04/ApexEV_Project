package com.apexev.service.service_Interface;

import com.apexev.dto.request.maintenance.ChecklistTemplateRequest;
import com.apexev.dto.response.maintenance.ChecklistTemplateResponse;

import java.util.List;

public interface ChecklistTemplateService {
    ChecklistTemplateResponse createTemplate(ChecklistTemplateRequest request);
    ChecklistTemplateResponse getTemplateById(Long id);
    List<ChecklistTemplateResponse> getAllTemplates();
    ChecklistTemplateResponse updateTemplate(Long id, ChecklistTemplateRequest request);
    void deleteTemplate(Long id);
}
