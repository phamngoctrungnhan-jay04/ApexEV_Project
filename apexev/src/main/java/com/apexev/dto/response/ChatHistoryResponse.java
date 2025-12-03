package com.apexev.dto.response;

import java.time.LocalDate;

public record ChatHistoryResponse(String user, String type, String message, LocalDate time) {
}
