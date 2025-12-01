package com.apexev.repository.hr;

import com.apexev.entity.Shift;
import com.apexev.enums.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    
    List<Shift> findByStatusOrderByStartTimeAsc(ShiftStatus status);
    
    List<Shift> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT s FROM Shift s WHERE s.startTime <= :endTime AND s.endTime >= :startTime")
    List<Shift> findOverlappingShifts(@Param("startTime") LocalDateTime startTime, 
                                      @Param("endTime") LocalDateTime endTime);
}

