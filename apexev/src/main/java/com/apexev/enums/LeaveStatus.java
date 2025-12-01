package com.apexev.enums;

public enum LeaveStatus {
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Đã từ chối"),
    CANCELLED("Đã hủy");

    private final String description;

    LeaveStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

