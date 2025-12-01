package com.apexev.service.serviceImpl;

import com.apexev.dto.request.userAndVehicleRequest.VehicleRequest;
import com.apexev.dto.response.userAndVehicleResponse.VehicleResponse;
import com.apexev.entity.User;
import com.apexev.entity.Vehicle;
import com.apexev.enums.AppointmentStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.AppointmentRepository;
import com.apexev.repository.userAndVehicle.VehicleRepository;
import com.apexev.service.service_Interface.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleImpl implements VehicleService {
    private final VehicleRepository vehicleRepository;
    private final AppointmentRepository appointmentRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<VehicleResponse> getMyVehicles(User loggedInUser) { // trả về phải là 1 list data được chuẩn hóa -> VehicleResponse
        // 1. lấy danh sách xe từ db theo id của user
        List<Vehicle> vehicles = vehicleRepository.findByCustomerUserId(loggedInUser.getUserId());
        // 2. danh sách nên dùng stream để map sang danh sách response
        return vehicles.stream() // đặt lên băng chuyền
                .map(vehicle -> modelMapper.map(vehicles, VehicleResponse.class)) //mapper
                .collect(Collectors.toList()); // đóng gói
    }

    @Override
    public VehicleResponse getVehicleById(Long vehicleId, User loggedInUser) {
        // 1. ktra xe có tồn tại và ktra quyền sở hữu
        Vehicle vehicle = findVehicleAndCheckOwnership(vehicleId, loggedInUser);
        // 2. map và trả về
        return modelMapper.map(vehicle, VehicleResponse.class);
    }

    @Override
    public VehicleResponse addVehicle(VehicleRequest request, User loggedInUser) {
        // 1. ktra xe đã tồn tại chưa -> tức là ktra biển số xe có trùng ko
        vehicleRepository.findByLicensePlate(request.getLicensePlate()).ifPresent(vehicle -> {
            throw new IllegalArgumentException("Biển số xe " + request.getLicensePlate() + " đã tồn tại.");
        });
        // 2. chuyển request người dung gửi -> form vehicle
        // mục đích chuyển data thô của người dùng thành entity Vehicle để ứng dụng có thể hiểu -> chuẩn hóa dữ liệu
        Vehicle newVehicle = modelMapper.map(request, Vehicle.class);
        // 3. gán chủ sở hữu xe -> tức là người đang đăng nhập để tạo thông tin xe
        newVehicle.setCustomer(loggedInUser);
        // 4. Lưu và db
        Vehicle savedVehicle = vehicleRepository.save(newVehicle);
        // 5. map và trả về
        return modelMapper.map(savedVehicle, VehicleResponse.class);
    }

    @Override
    public VehicleResponse updateVehicle(Long vehicleId, VehicleRequest request, User loggedInUser) {
        // 1. Tìm xe và kiểm tra quyền sở hữu
        Vehicle existingVehicle = findVehicleAndCheckOwnership(vehicleId, loggedInUser);
        // 2. Nếu update biển số thì ktra thử có trùng biển số không
        vehicleRepository.findByLicensePlate(request.getLicensePlate()).ifPresent(vehicle -> {
            // Nếu biển số trùng, và nó KHÔNG PHẢI là chính chiếc xe này -> Báo lỗi
            if (!vehicle.getId().equals(existingVehicle.getId())) {
                throw new IllegalArgumentException("Biển số xe " + request.getLicensePlate() + " đã tồn tại.");
            }
        });
        // 3. Dùng ModelMapper để cập nhật các trường từ Request -> Entity
        // tức là lưu data từ request vào existingVehicle
        modelMapper.map(request, existingVehicle);
        // 4. lưu lại và map
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return modelMapper.map(updatedVehicle, VehicleResponse.class);

        // giải thích bước 3
        /*
        modelMapper.map() -> có 2 cách : map(source, Class): Tạo một đối tượng mới (dùng cho create).
                                         map(source, destination): Cập nhật một đối tượng đã tồn tại (dùng cho update).
        dòng code ở bước 3 tương đương với:
            existingVehicle.setLicensePlate(request.getLicensePlate());
            existingVehicle.setBrand(request.getBrand());
            existingVehicle.setModel(request.getModel());
            existingVehicle.setYearManufactured(request.getYearManufactured());
        => modelMapper hỗ trợ chuyển đổi response và update cũng khá hay
         */
    }

    @Override
    public void deleteVehicle(Long vehicleId, User loggedInUser) {
        // 1. Tìm xe và kiểm tra quyền sở hữu
        Vehicle vehicle = findVehicleAndCheckOwnership(vehicleId, loggedInUser);
        // 2. Kiểm tra xem xe này đang có lịch hẹn hay đang chờ duyệt lịch hẹn ko pending/confirm
        List<AppointmentStatus> activeStatuses = Arrays.asList(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
        boolean hasActiveAppointments = appointmentRepository.existsByVehicleIdAndStatusIn(vehicleId, activeStatuses);

        if (hasActiveAppointments) {
            throw new IllegalStateException("Không thể xóa xe này. Xe đang có lịch hẹn đang chờ hoặc đã xác nhận.");
        }
        // 3. Nếu không bị gì -> Xóa
        vehicleRepository.delete(vehicle);
    }

    // logic dùng chung nhiều lần
    // logic tìm xe và ktra quyền sở hữu
    private Vehicle findVehicleAndCheckOwnership(Long vehicleId, User loggedInUser) {
        // 1. Tìm xe
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy xe với ID: " + vehicleId));

        // 2. Kiểm tra quyền (Chỉ CUSTOMER mới bị check, ADMIN/Advisor thì không bị check)
        if (loggedInUser.getRole() == UserRole.CUSTOMER &&
                !vehicle.getCustomer().getUserId().equals(loggedInUser.getUserId())) {

            throw new AccessDeniedException("Bạn không có quyền truy cập xe này.");
        }

        return vehicle;
    }
}
