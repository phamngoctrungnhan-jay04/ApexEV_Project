package com.apexev.controller;

import com.apexev.dto.request.MailRequest;
import com.apexev.service.serviceIplm.MailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController

@CrossOrigin(origins = "*", maxAge = 3600)
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
