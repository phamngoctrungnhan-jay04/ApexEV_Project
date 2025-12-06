package com.apexev.enums;

public enum OrderStatus {
    CONFIRMED, // Đã xác nhận lịch hẹn, chờ kỹ thuật viên tiếp nhận
    RECEPTION, // Đã tiếp nhận xe
    INSPECTION, // Đang kiểm tra
    WAITING_FOR_PARTS, // Chờ phụ tùng
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    QUOTING,
    READY_FOR_INVOICE // Kỹ thuật viên hoàn thành công việc, chờ cố vấn xuất hóa đơn
}
