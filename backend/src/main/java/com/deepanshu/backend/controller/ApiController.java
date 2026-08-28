package com.deepanshu.backend.controller;

import com.deepanshu.backend.model.ChatMessage;
import com.deepanshu.backend.websocket.MessageWebSocketHandler;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class ApiController {

    private final MessageWebSocketHandler messageWebSocketHandler;
    private final com.deepanshu.backend.service.EmailNotificationService emailNotificationService;

    public ApiController(MessageWebSocketHandler messageWebSocketHandler, com.deepanshu.backend.service.EmailNotificationService emailNotificationService) {
        this.messageWebSocketHandler = messageWebSocketHandler;
        this.emailNotificationService = emailNotificationService;
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        long heapUsedMB = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);

        health.put("status", "ONLINE");
        health.put("framework", "Spring Boot 3.4 (Java 21)");
        health.put("node", "deepanshu-cloud-ap-south-1");
        health.put("activeRegion", "ap-south-1 (Mumbai)");
        health.put("uptimeSeconds", uptimeSeconds);
        health.put("heapMemoryMB", heapUsedMB);
        health.put("activeWebSocketConnections", messageWebSocketHandler.getActiveSessionCount());
        health.put("totalMessagesReceived", messageWebSocketHandler.getMessageHistory().size());
        health.put("cloudStack", List.of("Spring Boot", "WebSocket", "AWS EC2", "Terraform", "Docker", "Prometheus", "Grafana"));
        health.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(health);
    }

    @GetMapping("/api/messages")
    public ResponseEntity<Map<String, Object>> getMessages() {
        Map<String, Object> response = new HashMap<>();
        List<ChatMessage> list = messageWebSocketHandler.getMessageHistory();
        response.put("count", list.size());
        response.put("messages", list);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, Object>> handleContact(@RequestBody ChatMessage incoming) {
        if (incoming.getId() == null || incoming.getId().isEmpty()) {
            incoming.setId("msg_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (incoming.getTimestamp() == null || incoming.getTimestamp().isEmpty()) {
            incoming.setTimestamp(Instant.now().toString());
        }
        incoming.setStatus("DELIVERED");
        incoming.setType("REST");

        messageWebSocketHandler.getMessageHistory().add(incoming);

        // Forward message directly to deep270804@gmail.com
        emailNotificationService.sendNotification(incoming);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Message delivered directly to Deepanshu! Thank you for reaching out.");
        res.put("id", incoming.getId());
        res.put("timestamp", incoming.getTimestamp());

        return ResponseEntity.ok(res);
    }

    @GetMapping("/resume.pdf")
    public ResponseEntity<Resource> getResumePdf() {
        File file = new File("../public/resume.pdf");
        if (!file.exists()) {
            file = new File("public/resume.pdf");
        }
        if (!file.exists()) {
            file = new File("C:/Users/LENOVO/Desktop/portfolio/public/resume.pdf");
        }

        if (file.exists()) {
            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Resume-Deepanshu-Mishra.pdf\"")
                    .body(resource);
        }

        return ResponseEntity.notFound().build();
    }
}
