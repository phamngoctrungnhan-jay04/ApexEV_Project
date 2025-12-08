package com.apexev.enums;

public enum PartRequestStatus {
    PENDING, // Đang chờ duyệt
    APPROVED, // Đã duyệt
    QUOTED, // Đã gửi báo giá cho customer
    REJECTED, // Từ chối
    FULFILLED, // Đã cấp phát (customer đã duyệt)
    CANCELLED // Đã hủy
}
