package com.apexev.enums;

public enum OrderStatus {
    RECEPTION,
    INSPECTION, // đang ktra
    WAITING_FOR_PARTS, //chờ phụ tùng
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    QUOTING,
    READY_FOR_INVOICE // đây là trạng thái trung gian khi mà kỹ thuật viên hoàn thành công việc -> để cố vấn có thể biết
}
