package com.apexev.repository.hr;

import com.apexev.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Integer> {
    
    Optional<LeaveType> findByCode(String code);
    
    List<LeaveType> findByIsActiveTrue();
}

