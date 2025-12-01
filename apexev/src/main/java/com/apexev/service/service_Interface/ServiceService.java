package com.apexev.service.service_Interface;

import com.apexev.entity.MaintenanceService;
import java.util.List;

public interface ServiceService {
    // Định nghĩa phương thức mà Controller sẽ gọi
    List<MaintenanceService> getAllServices();

    MaintenanceService createService(MaintenanceService service);

    MaintenanceService updateService(Long id, MaintenanceService service);

    void deleteService(Long id);
}