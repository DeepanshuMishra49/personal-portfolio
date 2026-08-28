package com.deepanshu.backend.service;

import com.deepanshu.backend.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${portfolio.recipient.email:deep270804@gmail.com}")
    private String recipientEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailNotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotification(ChatMessage message) {
        String subject = "[Deepanshu's Messenger] " + message.getSubject() + " (from " + message.getName() + ")";
        
        String body = "Hello Deepanshu,\n\n"
                + "You received a new message through Deepanshu's Messenger on your Portfolio:\n\n"
                + "======================================================\n"
                + "Sender Name:    " + message.getName() + "\n"
                + "Sender Email:   " + message.getEmail() + "\n"
                + "Subject:        " + message.getSubject() + "\n"
                + "Timestamp:      " + message.getTimestamp() + "\n"
                + "Message ID:     " + message.getId() + "\n"
                + "======================================================\n\n"
                + "Message Content:\n"
                + message.getMessage() + "\n\n"
                + "======================================================\n"
                + "Reply directly to: " + message.getEmail() + "\n";

        System.out.println("=================================================");
        System.out.println("📧 FORWARDING DISPATCH TO: " + recipientEmail);
        System.out.println("Subject: " + subject);
        System.out.println("From: " + message.getName() + " <" + message.getEmail() + ">");
        System.out.println("=================================================");

        if (mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty()) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom(mailUsername);
                mail.setTo(recipientEmail);
                mail.setReplyTo(message.getEmail());
                mail.setSubject(subject);
                mail.setText(body);

                mailSender.send(mail);
                System.out.println("✅ [Email Service] Successfully delivered email to " + recipientEmail);
            } catch (Exception e) {
                System.err.println("⚠️ [Email Service] Could not send via SMTP (" + e.getMessage() + "). Message is logged above.");
            }
        } else {
            System.out.println("ℹ️ [Email Service] SMTP credentials not configured in application.properties. To send live emails, set spring.mail.username and spring.mail.password.");
        }
    }
}
