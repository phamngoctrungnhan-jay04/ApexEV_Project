package com.apexev.controller.userAndVehicleController;

import com.apexev.dto.request.userAndVehicleRequest.MailRequest;
import com.apexev.service.serviceImpl.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class MailController {
    @Autowired
    private MailService mailService;
    @PostMapping(path = "/sendMail"  )
//    @PreAuthorize("permitAll()")
    public ResponseEntity<?> sendMail(@RequestBody MailRequest mailRequest) {
        try {
            mailService.sendEmail(mailRequest.getTo(), mailRequest.getSubject(), mailRequest.getBody(), null);
            return ResponseEntity.ok("Email đã được gửi thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Đã xảy ra lỗi không mong muốn: " + e.getMessage());
        }
    }
}
