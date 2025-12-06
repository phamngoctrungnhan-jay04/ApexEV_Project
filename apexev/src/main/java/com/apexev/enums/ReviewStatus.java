package com.apexev.enums;

public enum ReviewStatus {
    DRAFT("Bản nháp"),
    SUBMITTED("Đã gửi"),
    IN_REVIEW("Đang đánh giá"),
    FINALIZED("Đã hoàn tất");

    private final String description;

    ReviewStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

