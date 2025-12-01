package com.apexev.enums;

public enum UserRole {
    CUSTOMER("Khách hàng"),
    ADMIN("Quản trị viên"),
    BUSINESS_MANAGER("Quản lý kinh doanh"),
    TECHNICIAN("Kỹ thuật viên"),
    SERVICE_ADVISOR("Cố vấn dịch vụ");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}