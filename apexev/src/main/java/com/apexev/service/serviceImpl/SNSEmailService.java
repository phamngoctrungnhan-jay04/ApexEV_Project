package com.apexev.service.serviceImpl;

import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SNSEmailService {

    private final AmazonSNS snsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.sns.email-topic-arn}")
    private String emailTopicArn;

    /**
     * Gửi email xác nhận đăng ký
     */
    public void sendRegistrationConfirmationEmail(String email, String fullName, String confirmationLink) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "REGISTRATION_CONFIRMATION");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("confirmationLink", confirmationLink);
        emailData.put("subject", "Xác nhận đăng ký tài khoản ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Gửi email xác nhận đặt lịch hẹn
     */
    public void sendAppointmentConfirmationEmail(String email, String fullName, String appointmentDate, 
                                                  String vehicleInfo, String serviceType) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "APPOINTMENT_CONFIRMATION");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("appointmentDate", appointmentDate);
        emailData.put("vehicleInfo", vehicleInfo);
        emailData.put("serviceType", serviceType);
        emailData.put("subject", "Xác nhận đặt lịch hẹn - ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Gửi email nhắc nhở cuộc hẹn (24 giờ trước)
     */
    public void sendAppointmentReminderEmail(String email, String fullName, String appointmentDate, 
                                             String appointmentTime, String vehicleInfo) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "APPOINTMENT_REMINDER");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("appointmentDate", appointmentDate);
        emailData.put("appointmentTime", appointmentTime);
        emailData.put("vehicleInfo", vehicleInfo);
        emailData.put("subject", "Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Gửi email xác nhận thanh toán
     */
    public void sendPaymentConfirmationEmail(String email, String fullName, String invoiceNumber, 
                                             Double amount, String paymentDate) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "PAYMENT_CONFIRMATION");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("invoiceNumber", invoiceNumber);
        emailData.put("amount", amount);
        emailData.put("paymentDate", paymentDate);
        emailData.put("subject", "Xác nhận thanh toán - ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Gửi email cảm ơn và nhắc nhở lấy xe sau khi thanh toán
     */
    public void sendPaymentThankYouAndPickupReminderEmail(String email, String fullName, String invoiceNumber,
                                                          String vehicleInfo, String serviceDetails) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "PAYMENT_THANK_YOU_PICKUP_REMINDER");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("invoiceNumber", invoiceNumber);
        emailData.put("vehicleInfo", vehicleInfo);
        emailData.put("serviceDetails", serviceDetails);
        emailData.put("subject", "Cảm ơn bạn! Nhắc nhở lấy xe - ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Gửi email nhắc nhở đặt lịch lấy xe sau khi bảo dưỡng hoàn thành
     */
    public void sendPickupScheduleReminderEmail(String email, String fullName, String vehicleInfo,
                                                String appointmentScheduleLink) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("type", "PICKUP_SCHEDULE_REMINDER");
        emailData.put("email", email);
        emailData.put("fullName", fullName);
        emailData.put("vehicleInfo", vehicleInfo);
        emailData.put("appointmentScheduleLink", appointmentScheduleLink);
        emailData.put("subject", "Nhắc nhở: Đặt lịch lấy xe tại ApexEV");

        publishEmailEvent(emailData);
    }

    /**
     * Publish email event lên SNS Topic
     */
    private void publishEmailEvent(Map<String, Object> emailData) {
        try {
            String messageBody = objectMapper.writeValueAsString(emailData);

            PublishRequest publishRequest = new PublishRequest()
                    .withTopicArn(emailTopicArn)
                    .withMessage(messageBody)
                    .withSubject((String) emailData.get("subject"));

            PublishResult result = snsClient.publish(publishRequest);

            log.info("Email event published to SNS: messageId={}, type={}", 
                    result.getMessageId(), emailData.get("type"));

        } catch (Exception e) {
            log.error("Error publishing email event to SNS", e);
            throw new RuntimeException("Failed to publish email event: " + e.getMessage());
        }
    }
}
