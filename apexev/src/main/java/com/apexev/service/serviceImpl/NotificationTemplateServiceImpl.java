package com.apexev.service.serviceImpl;

import com.apexev.dto.request.supportAndSystem.NotificationTemplateRequest;
import com.apexev.dto.response.supportAndSystem.NotificationTemplateResponse;
import com.apexev.entity.NotificationTemplate;
import com.apexev.exception.ResourceNotFoundException;
import com.apexev.repository.supportAndSystem.NotificationTemplateRepository;
import com.apexev.service.service_Interface.NotificationTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateRepository repository;

    @Override
    public NotificationTemplateResponse create(NotificationTemplateRequest request) {
        NotificationTemplate n = new NotificationTemplate();
        n.setTemplateKey(request.getTemplateKey());
        n.setSubject(request.getSubject());
        n.setBody(request.getBody());
        NotificationTemplate saved = repository.save(n);
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateResponse getById(Long id) {
        NotificationTemplate n = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found: " + id));
        return map(n);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getAll() {
        return repository.findAll().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public NotificationTemplateResponse update(Long id, NotificationTemplateRequest request) {
        NotificationTemplate n = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found: " + id));
        n.setTemplateKey(request.getTemplateKey());
        n.setSubject(request.getSubject());
        n.setBody(request.getBody());
        NotificationTemplate saved = repository.save(n);
        return map(saved);
    }

    @Override
    public void delete(Long id) {
        NotificationTemplate n = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found: " + id));
        repository.delete(n);
    }

    private NotificationTemplateResponse map(NotificationTemplate n) {
        return new NotificationTemplateResponse(n.getId(), n.getTemplateKey(), n.getSubject(), n.getBody(), n.getCreatedAt());
    }
}
