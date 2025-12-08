package com.apexev.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIProxyController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String AWS_AI_ENDPOINT = "https://zwzx1oerz7.execute-api.us-east-1.amazonaws.com/default/Chat";

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(@RequestBody Map<String, String> request) {
        try {
            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Tạo request entity
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            // Gọi AWS API Gateway
            ResponseEntity<String> response = restTemplate.exchange(
                    AWS_AI_ENDPOINT,
                    HttpMethod.POST,
                    entity,
                    String.class);

            String responseBody = response.getBody();

            // Kiểm tra response có null không
            if (responseBody == null || responseBody.isEmpty()) {
                return ResponseEntity.ok(Map.of("response", "Xin lỗi, AI không phản hồi."));
            }

            // Thử parse JSON, nếu fail thì trả về raw string
            try {
                Map<String, Object> parsedResponse = objectMapper.readValue(responseBody, Map.class);
                return ResponseEntity.ok(parsedResponse);
            } catch (Exception parseException) {
                // Nếu không phải JSON, trả về dạng object với key "response"
                return ResponseEntity.ok(Map.of("response", responseBody));
            }

        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi ra console để debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to communicate with AI service",
                            "details", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
