package com.apexev.repository.userAndVehicle;

import com.apexev.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<StaffProfile, Integer> {

}
