package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.ReviewStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PerformanceReviewResponse {
    
    private Integer reviewId;
    private Integer staffId;
    private String staffName;
    private String reviewerName;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private ReviewStatus status;
    private Double overallRating;
    private String strengths;
    private String weaknesses;
    private String recommendations;
    private String feedback;
    private LocalDateTime finalizedAt;
    private List<KPIScoreResponse> kpiScores;
    
    @Data
    public static class KPIScoreResponse {
        private Integer kpiId;
        private String kpiName;
        private Double score;
        private String comment;
    }
}

