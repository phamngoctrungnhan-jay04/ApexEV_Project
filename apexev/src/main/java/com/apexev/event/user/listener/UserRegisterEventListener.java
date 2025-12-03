package com.apexev.event.user.listener;

import com.apexev.entity.StaffProfile;
import com.apexev.entity.User;
import com.apexev.event.user.UserRegisterEvent;
import com.apexev.repository.userAndVehicle.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserRegisterEventListener {
    @Autowired
    StaffRepository staffRepository;

    @EventListener
    public void onUserRegisterEvent(UserRegisterEvent event) {
        if (event == null) {
            return;
        }
        if (!(event.getUserProfile().getRole().equals("CUSTOMER"))) {
            StaffProfile staffProfile = new StaffProfile();
            User user = event.getUserProfile();
            staffProfile.setUser(user);

            staffRepository.save(staffProfile);
          // sau cai nay la
//            Hibernate: insert into user (created_at,email,full_name,is_active,password_hash,phone,role) values (?,?,?,?,?,?,?)
//            Hibernate: insert into staff_profiles (employee_code,hire_date,staff_id) values (?,?,?)
            staffProfile.setEmployeeCode(user.getRole().toString() + staffProfile.getId());
            staffRepository.save(staffProfile);
        }

    }
}
