package com.apexev.event.user;

import com.apexev.entity.StaffProfile;
import com.apexev.entity.User;

public class UserRegisterEvent {
   private final User staffProfile;
   public UserRegisterEvent(User staffProfile) {
       this.staffProfile = staffProfile;
   }
   public User getUserProfile() {
       return staffProfile;
   }
}
