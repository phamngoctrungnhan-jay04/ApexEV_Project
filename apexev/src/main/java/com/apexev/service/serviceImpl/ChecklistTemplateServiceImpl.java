package com.apexev.service.serviceImpl;

import com.apexev.dto.request.maintenance.ChecklistTemplateRequest;
import com.apexev.dto.response.maintenance.ChecklistTemplateItemResponse;
import com.apexev.dto.response.maintenance.ChecklistTemplateResponse;
import com.apexev.entity.ChecklistTemplate;
import com.apexev.entity.ChecklistTemplateItem;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.maintenance.ChecklistTemplateRepository;
import com.apexev.service.service_Interface.ChecklistTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistTemplateServiceImpl implements ChecklistTemplateService {

    private final ChecklistTemplateRepository checklistTemplateRepository;

    @Override
    public ChecklistTemplateResponse createTemplate(ChecklistTemplateRequest request) {
        ChecklistTemplate template = new ChecklistTemplate();
        template.setTemplateName(request.getTemplateName());
        template.setDescription(request.getDescription());

        Set<ChecklistTemplateItem> items = request.getItems().stream().map(i -> {
            ChecklistTemplateItem it = new ChecklistTemplateItem();
            it.setItemName(i.getItemName());
            it.setItemDescription(i.getDescription());
            it.setTemplate(template);
            return it;
        }).collect(Collectors.toSet());

        template.setItems(items);

        ChecklistTemplate saved = checklistTemplateRepository.save(template);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ChecklistTemplateResponse getTemplateById(Long id) {
        ChecklistTemplate t = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChecklistTemplate not found: " + id));
        return mapToResponse(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistTemplateResponse> getAllTemplates() {
        return checklistTemplateRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ChecklistTemplateResponse updateTemplate(Long id, ChecklistTemplateRequest request) {
        ChecklistTemplate t = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChecklistTemplate not found: " + id));

        t.setTemplateName(request.getTemplateName());
        t.setDescription(request.getDescription());

        // Replace items
        t.getItems().clear();
        Set<ChecklistTemplateItem> items = request.getItems().stream().map(i -> {
            ChecklistTemplateItem it = new ChecklistTemplateItem();
            it.setItemName(i.getItemName());
            it.setItemDescription(i.getDescription());
            it.setTemplate(t);
            return it;
        }).collect(Collectors.toSet());

        t.getItems().addAll(items);

        ChecklistTemplate saved = checklistTemplateRepository.save(t);
        return mapToResponse(saved);
    }

    @Override
    public void deleteTemplate(Long id) {
        ChecklistTemplate t = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChecklistTemplate not found: " + id));
        checklistTemplateRepository.delete(t);
    }

    private ChecklistTemplateResponse mapToResponse(ChecklistTemplate t) {
        List<ChecklistTemplateItemResponse> items = t.getItems().stream().map(i ->
            new ChecklistTemplateItemResponse(i.getId(), i.getItemName(), i.getItemDescription())
        ).collect(Collectors.toList());

        return new ChecklistTemplateResponse(t.getId(), t.getTemplateName(), t.getDescription(), items);
    }
}
