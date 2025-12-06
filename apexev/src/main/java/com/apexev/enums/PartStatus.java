package com.apexev.enums;

public enum PartStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Không hoạt động"),
    DISCONTINUED("Ngừng sản xuất"),
    OUT_OF_STOCK("Hết hàng");

    private final String description;

    PartStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
