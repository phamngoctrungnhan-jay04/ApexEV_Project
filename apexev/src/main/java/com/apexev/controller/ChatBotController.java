package com.apexev.controller;

import com.apexev.security.services.UserDetailsImpl;
import com.apexev.service.serviceIplm.ChatBoxService;
import org.springframework.ai.chat.messages.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatBotController {

    @Autowired
    private ChatBoxService chatService;
    @Autowired
    private JdbcTemplate jdbcTemplate;


    //Cái này sẽ đợi response hết token rồi mới hiện kết quả
//        @PostMapping("/chat")
//        public String chat(@RequestParam String message) {
//            return chatService.getResponse(message);
//        }
//
//        @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
//        public Flux<String> stream(@RequestParam String q) {
//            return chatService.chatStream(q);
//        }

    @PostMapping(value = "/chatbox", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> Chat(Authentication authentication, @RequestParam String message) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Integer userId = userDetails.getId();
            return chatService.ChatProcess(userId.toString(), message);
        } catch (Exception e) {
            return chatService.ChatProcess(message);
        }
    }
    //Chat History By User

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getChatHistory(Authentication authentication) {
        try{
            UserDetailsImpl userDetails = (UserDetailsImpl)  authentication.getPrincipal();
            List<Message> list;
            list = chatService.ChatHistory(userDetails.getId().toString());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            throw new RuntimeException("Error in getting chat history");
        }


    }

}

