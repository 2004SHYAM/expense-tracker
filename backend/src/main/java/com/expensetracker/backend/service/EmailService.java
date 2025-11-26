package com.expensetracker.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * ----------------------------------------------------------------------------
 * EmailService
 * ----------------------------------------------------------------------------
 * This service is responsible for sending emails from your application.
 *
 * Spring Boot uses JavaMailSender, which is automatically configured using
 * values from application.properties (SMTP server, username, password, etc.)
 *
 * Wherever you need to send an email (password reset, notifications, etc.),
 * you inject this service and call sendEmail().
 * ----------------------------------------------------------------------------
 */
@Service
public class EmailService {

    /** 
     * JavaMailSender is Spring’s built-in tool that knows how to connect to an
     * SMTP server and send emails.
     *
     * Spring automatically injects (autowires) the configured mail sender.
     */
    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a simple plain-text email.
     *
     * @param to       Recipient email address
     * @param subject  Email subject line
     * @param text     Body content of the email
     *
     * Steps:
     * 1. Create a SimpleMailMessage object.
     * 2. Add recipient, subject, body.
     * 3. Set a "no-reply" sender address.
     * 4. Send the email using mailSender.
     * 5. Log the result (success or failure).
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            // Build the email structure.
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            // Setting a static 'no-reply' email — common practice for system messages.
            message.setFrom("no-reply@expensetracker.com");

            // Actually send the email.
            mailSender.send(message);

            System.out.println("✅ Email sent successfully to: " + to);

        } catch (Exception e) {
            // If something goes wrong (SMTP failure, invalid address, etc.)
            System.err.println("❌ Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
