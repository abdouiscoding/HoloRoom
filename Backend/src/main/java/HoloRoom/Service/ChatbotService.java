package HoloRoom.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(List<Map<String, Object>> conversationHistory) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCGaJoZvctrzo0aWhRT7b7oQWVjQUdJ_VY";

        // the request
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", conversationHistory);

        // instruction
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(
                Map.of("text",
                        "You are HoloRoom AI Assistant, a helpful shopping assistant for an AR furniture store. Help users find furniture, give design advice, and answer questions about products. Keep responses concise (2-3 sentences max).")));
        requestBody.put("systemInstruction", systemInstruction);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        // the response
        Map body = response.getBody();
        List<Map> candidates = (List<Map>) body.get("candidates");
        Map content = (Map) candidates.get(0).get("content");
        List<Map> parts = (List<Map>) content.get("parts");
        return (String) parts.get(0).get("text");
    }
}
