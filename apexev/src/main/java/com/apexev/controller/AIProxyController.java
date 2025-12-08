package com.apexev.controller;

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

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to communicate with AI service", "details", e.getMessage()));
        }
    }
}
