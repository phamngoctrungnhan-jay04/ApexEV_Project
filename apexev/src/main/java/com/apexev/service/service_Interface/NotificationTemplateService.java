package com.apexev.service.service_Interface;

import com.apexev.dto.request.supportAndSystem.NotificationTemplateRequest;
import com.apexev.dto.response.supportAndSystem.NotificationTemplateResponse;

import java.util.List;

public interface NotificationTemplateService {
    NotificationTemplateResponse create(NotificationTemplateRequest request);
    NotificationTemplateResponse getById(Long id);
    List<NotificationTemplateResponse> getAll();
    NotificationTemplateResponse update(Long id, NotificationTemplateRequest request);
    void delete(Long id);
}
