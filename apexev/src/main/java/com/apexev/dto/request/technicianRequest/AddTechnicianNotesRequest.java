package com.apexev.dto.request.technicianRequest;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddTechnicianNotesRequest {
    @NotBlank(message = "Ghi chú không được để trống")
    private String notes;
}
