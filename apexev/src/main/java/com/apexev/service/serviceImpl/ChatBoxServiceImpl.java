//package com.apexev.service.serviceImpl;
//
//import com.apexev.service.service_Interface.ChatBoxService;
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
//import org.springframework.ai.chat.memory.ChatMemory;
//import org.springframework.ai.chat.memory.MessageWindowChatMemory;
//import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
//import org.springframework.ai.chat.messages.Message;
//import org.springframework.ai.chat.messages.SystemMessage;
//import org.springframework.ai.chat.messages.UserMessage;
//import org.springframework.ai.chat.model.StreamingChatModel;
//import org.springframework.ai.chat.prompt.Prompt;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import reactor.core.publisher.Flux;
//
//import java.util.List;
//
//@Service
//public class ChatBoxServiceImpl implements ChatBoxService {
////    @Autowired
//    private final ChatClient chatClient;
////    @Autowired
//    private final JdbcChatMemoryRepository memoryRepository;
//
//
//
//    public ChatBoxServiceImpl(ChatClient.Builder builder, JdbcChatMemoryRepository memoryRepository, StreamingChatModel streamingChatModel) {
//        this.memoryRepository = memoryRepository;
//        MessageWindowChatMemory memory = MessageWindowChatMemory.builder()
//                .chatMemoryRepository(memoryRepository)
//                .maxMessages(35)
//                .build();
//        this.chatClient = builder
//                .defaultAdvisors(MessageChatMemoryAdvisor.builder(memory).build())
//                .build();
//    }
//
//    @Override
//    public String getResponse(String message) {
//        String id="1";
//        SystemMessage systemMessage = new SystemMessage("""
//                You are ApexEV.AI Chatbot for ApexEV Electric Vehicle Service Center so must tell the answer with information about ApexEV.
//                You must focus on the Electric Car
//                You must answer follow text, don't include markdown
//                You must to base all content on the user message to chose language to response
//                You must to given short response to user
//                """);
//        UserMessage userMessage = new UserMessage(message);
//
//        return chatClient.prompt()
//                .system(systemMessage.getText())
//                .user(userMessage.getText())
//                .advisors(advisorSpec -> {
//                    advisorSpec.param(ChatMemory.CONVERSATION_ID, id);
//                })
//                .call()
//                .content();
//    }
//
////
////    @Autowired
////    private StreamingChatModel streamingChatModel;
////    public Flux<String> chatStream(String userInput) {
////        SystemMessage systemMessage = new SystemMessage("""
////                You are ApexEV.AI Chatbot for ApexEV Electric Vehicle Service Center so must tell the answer with information about ApexEV.
////                You must focus on the Electric Car
////                You must answer follow text, don't include markdown
////                """);
////        UserMessage userMessage = new UserMessage(userInput);
////        Message[] messages = new Message[]{systemMessage, userMessage};
////        Prompt prompt = Prompt
////                .builder()
////                .messages(messages)
////                .build();
////        System.out.println(prompt.toString());
////        return streamingChatModel.stream(prompt)
////                .flatMap(response -> Flux.just(response.getResult().getOutput().getText()));
////
////    }
//
//
//
//    @Override
//    public Flux<String> ChatProcess(String id,String message) {
//
//        SystemMessage systemMessage = new SystemMessage("""
//                You are ApexEV.AI Chatbot for ApexEV Electric Vehicle Service Center so must tell the answer with information about ApexEV.
//                You must focus on the Electric Car
//                You must answer by text, don't include markdown
//                You must to base all content on the user message to chose language to response
//                """);
//        UserMessage userMessage = new UserMessage(message);
//
//
//        return chatClient.prompt()
//                .system(systemMessage.getText())
//                .user(userMessage.getText())
//                .advisors(advisorSpec -> {
//                    advisorSpec.param(ChatMemory.CONVERSATION_ID, id);
//                })
//                .stream()
//                .content();
//    }
//
//    @Override
//    public Flux<String> ChatProcess(String message) {
//
//        SystemMessage systemMessage = new SystemMessage("""
//                You are ApexEV.AI Chatbot for ApexEV Electric Vehicle Service Center so must tell the answer with information about ApexEV.
//                You must focus on the Electric Car
//                You must answer by text, don't include markdown
//                You must to base all content on the user message to chose language to response
//                """);
//        UserMessage userMessage = new UserMessage(message);
//
//        return chatClient.prompt()
//                .system(systemMessage.getText())
//                .user(userMessage.getText())
//                .stream()
//                .content();
//
//    }
//
//    @Override
//    public List<Message> ChatHistory(String userId) {
//        return memoryRepository.findByConversationId(userId);
//    }
//
//}
