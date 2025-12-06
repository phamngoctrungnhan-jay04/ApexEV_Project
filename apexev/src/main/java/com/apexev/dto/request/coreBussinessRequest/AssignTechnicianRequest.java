package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTechnicianRequest {
    @NotNull(message = "Technician ID không được để trống")
    private Integer technicianId;

    // Ghi chú của cố vấn khi phân công
    private String advisorNotes;
}
