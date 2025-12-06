package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePerformanceReviewRequest {
    
    @NotNull(message = "ID nhân viên không được để trống")
    private Integer staffId;
    
    @NotNull(message = "Ngày bắt đầu chu kỳ không được để trống")
    private LocalDate periodStart;
    
    @NotNull(message = "Ngày kết thúc chu kỳ không được để trống")
    private LocalDate periodEnd;
    
    private Double overallRating;
    
    private String strengths;
    
    private String weaknesses;
    
    private String recommendations;
    
    private String feedback;
    
    private List<ReviewKPIRequest> kpis;
    
    @Data
    public static class ReviewKPIRequest {
        @NotNull(message = "ID KPI không được để trống")
        private Integer kpiId;
        
        @NotNull(message = "Điểm KPI không được để trống")
        private Double score;
        
        private String comment;
    }
}

