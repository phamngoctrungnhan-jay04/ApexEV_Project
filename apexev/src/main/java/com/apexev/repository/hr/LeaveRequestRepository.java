package com.apexev.repository.hr;

import com.apexev.entity.LeaveRequest;
import com.apexev.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {
    
    List<LeaveRequest> findByStaff_UserId(Integer staffId);
    
    List<LeaveRequest> findByStatus(LeaveStatus status);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.userId = :staffId " +
           "AND lr.status = 'APPROVED' " +
           "AND lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findApprovedLeavesInTimeRange(@Param("staffId") Integer staffId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate);
}

