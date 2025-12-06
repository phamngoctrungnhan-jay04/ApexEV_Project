package com.apexev.enums;

public enum ShiftStatus {
    SCHEDULED("Đã lên lịch"),
    IN_PROGRESS("Đang diễn ra"),
    COMPLETED("Đã hoàn thành"),
    CANCELLED("Đã hủy");

    private final String description;

    ShiftStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

