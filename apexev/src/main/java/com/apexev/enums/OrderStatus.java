package com.apexev.enums;

public enum OrderStatus {
    CONFIRMED, // Đã xác nhận lịch hẹn, chờ kỹ thuật viên tiếp nhận
    RECEPTION, // Đã tiếp nhận xe
    INSPECTION, // Đang kiểm tra
    WAITING_FOR_PARTS, // Chờ phụ tùng
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    QUOTING, // Đang báo giá phụ tùng
    QUOTE_REJECTED, // Customer từ chối báo giá, chờ advisor tư vấn lại
    READY_FOR_INVOICE, // Kỹ thuật viên hoàn thành công việc, chờ cố vấn xuất hóa đơn
    INVOICED // Đã xuất hóa đơn
}
