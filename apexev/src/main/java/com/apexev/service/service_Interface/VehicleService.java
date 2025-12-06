package com.apexev.service.service_Interface;

import com.apexev.dto.request.userAndVehicleRequest.VehicleRequest;
import com.apexev.dto.response.userAndVehicleResponse.VehicleResponse;
import com.apexev.entity.User;

import java.util.List;

public interface VehicleService {
    //lấy danh sách tất cả xe của người dùng đang đăng nhập
    List<VehicleResponse> getMyVehicles (User loggedInUser);

    //lấy thông tin chi tiết của 1 chiếc xe -> có kiểm tra quyền sở hữu
    VehicleResponse getVehicleById(Long vehicleId, User loggedInUser);

    //thêm một xe mới vào gara của người dùng đang đăng nhập
    VehicleResponse addVehicle(VehicleRequest request, User loggedInUser);

    //cập nhật thông tin xe - chỉ chủ xe mới cập nhật được
    VehicleResponse updateVehicle(Long vehicleId, VehicleRequest request, User loggedInUser);

    //xóa một chiếc xe khỏi gara - chỉ chủ xe mới xóa được
    //sẽ ko xóa được nếu xe đang có lịch hẹn - pending hoặc confirm
    List<VehicleResponse> getMyVehicles(User loggedInUser);

    VehicleResponse getVehicleById(Long vehicleId, User loggedInUser);

    VehicleResponse addVehicle(VehicleRequest request, User loggedInUser);

    VehicleResponse updateVehicle(Long vehicleId, VehicleRequest request, User loggedInUser);

    void deleteVehicle(Long vehicleId, User loggedInUser);
}
