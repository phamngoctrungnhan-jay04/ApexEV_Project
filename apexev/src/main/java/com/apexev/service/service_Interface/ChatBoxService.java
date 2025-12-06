package com.apexev.service.service_Interface;

import org.springframework.ai.chat.messages.Message;
import reactor.core.publisher.Flux;

import java.util.List;

public interface ChatBoxService {
    String getResponse(String message);

    Flux<String> ChatProcess(String id, String message);

    Flux<String> ChatProcess(String message);

    List<Message> ChatHistory(String userId);
}
