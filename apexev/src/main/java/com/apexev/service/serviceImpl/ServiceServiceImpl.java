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

    @Override
    public MaintenanceService createService(MaintenanceService service) {
        // Lưu service mới vào database
        return serviceRepository.save(service);
    }

    @Override
    public MaintenanceService updateService(Long id, MaintenanceService service) {
        // Tìm service theo ID
        MaintenanceService existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        // Cập nhật các trường
        existingService.setName(service.getName());
        existingService.setNameEn(service.getNameEn());
        existingService.setDescription(service.getDescription());
        existingService.setDescriptionEn(service.getDescriptionEn());
        existingService.setCategory(service.getCategory());
        existingService.setUnitPrice(service.getUnitPrice());
        existingService.setEstimatedDuration(service.getEstimatedDuration());
        existingService.setIsActive(service.getIsActive());

        // Lưu lại
        return serviceRepository.save(existingService);
    }

    @Override
    public void deleteService(Long id) {
        // Kiểm tra tồn tại
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Service not found with id: " + id);
        }
        // Xóa
        serviceRepository.deleteById(id);
    }
}