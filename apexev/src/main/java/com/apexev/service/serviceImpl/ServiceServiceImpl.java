package com.apexev.service.serviceImpl; // PACKAGE CHÍNH XÁC theo cấu trúc của bạn

import com.apexev.entity.MaintenanceService;
import com.apexev.repository.coreBussiness.ServiceRepository;
import com.apexev.service.service_Interface.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Đánh dấu là Bean Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    // Inject ServiceRepository
    private final ServiceRepository serviceRepository;

    @Override
    public List<MaintenanceService> getAllServices() {
        // Gọi findAll() để lấy dữ liệu từ Database
        return serviceRepository.findAll();
    }
}