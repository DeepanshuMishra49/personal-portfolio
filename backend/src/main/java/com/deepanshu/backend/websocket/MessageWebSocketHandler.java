package com.deepanshu.backend.websocket;

import com.deepanshu.backend.model.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class MessageWebSocketHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> activeSessions = new CopyOnWriteArrayList<>();
    private final List<ChatMessage> messageHistory = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final com.deepanshu.backend.service.EmailNotificationService emailNotificationService;

    public MessageWebSocketHandler(com.deepanshu.backend.service.EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        activeSessions.add(session);
        System.out.println("🟢 [WebSocket] New client session connected: " + session.getId());

        ChatMessage welcome = new ChatMessage(
                "sys_" + System.currentTimeMillis(),
                "System",
                "system@deepanshumishra.cloud",
                "Connection Established",
                "Connected to Deepanshu Mishra's Cloud Node WebSocket Gateway (ap-south-1).",
                "SYSTEM",
                Instant.now().toString(),
                "CONNECTED"
        );

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(welcome)));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("📩 [WebSocket] Received payload: " + payload);

        try {
            ChatMessage incoming = objectMapper.readValue(payload, ChatMessage.class);

            if (incoming.getId() == null || incoming.getId().isEmpty()) {
                incoming.setId("msg_" + UUID.randomUUID().toString().substring(0, 8));
            }
            if (incoming.getTimestamp() == null || incoming.getTimestamp().isEmpty()) {
                incoming.setTimestamp(Instant.now().toString());
            }
            incoming.setStatus("DELIVERED");

            messageHistory.add(incoming);

            // Forward message directly to deep270804@gmail.com
            emailNotificationService.sendNotification(incoming);

            // Send instant Delivery Acknowledgment back to client
            ChatMessage ack = new ChatMessage(
                    incoming.getId(),
                    "Deepanshu Mishra Cloud Node",
                    "deep270804@gmail.com",
                    "Message Acknowledged",
                    "Your message has been delivered directly to Deepanshu. Thank you!",
                    "ACK",
                    Instant.now().toString(),
                    "DELIVERED"
            );

            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(ack)));

        } catch (Exception e) {
            System.err.println("❌ [WebSocket] Error parsing message: " + e.getMessage());
            ChatMessage errorAck = new ChatMessage(
                    "err_" + System.currentTimeMillis(),
                    "System Error",
                    "error@deepanshumishra.cloud",
                    "Error",
                    "Failed to process message format. Please send valid JSON.",
                    "ERROR",
                    Instant.now().toString(),
                    "FAILED"
            );
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorAck)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        activeSessions.remove(session);
        System.out.println("🔴 [WebSocket] Session disconnected: " + session.getId() + " status: " + status);
    }

    public List<ChatMessage> getMessageHistory() {
        return messageHistory;
    }

    public int getActiveSessionCount() {
        return activeSessions.size();
    }
}
