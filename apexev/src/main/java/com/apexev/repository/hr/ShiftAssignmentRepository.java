package com.apexev.repository.hr;

import com.apexev.entity.ShiftAssignment;
import com.apexev.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Integer> {
    
    List<ShiftAssignment> findByStaff(User staff);
    
    List<ShiftAssignment> findByShift_ShiftId(Integer shiftId);
    
    @Query("SELECT sa FROM ShiftAssignment sa WHERE sa.staff.userId = :staffId " +
           "AND sa.shift.startTime <= :endTime AND sa.shift.endTime >= :startTime")
    List<ShiftAssignment> findStaffAssignmentsInTimeRange(@Param("staffId") Integer staffId,
                                                           @Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);
}

