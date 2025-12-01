package com.apexev.service.service_Interface;

import org.springframework.web.multipart.MultipartFile;

public interface MailService {
    String sendEmail(String toWho, String subject, String body, MultipartFile[] files);
}
