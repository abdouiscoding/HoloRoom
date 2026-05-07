package HoloRoom.Service;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    @Value("${api.key}")
    private String API_KEY;

    private static final String MODEL = "llama-3.1-8b-instant";
    private static final String URL = "https://api.groq.com/openai/v1/chat/completions";

    public static class Message {
        public String role; // "user" or "assistant"
        public String text;
    }

    public String askai(String message, List<Message> history) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(API_KEY);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", MODEL);
            requestBody.put("temperature", 0.2); // makes output more stable

            JSONArray messages = new JSONArray();

            // =========================
            // SYSTEM PROMPT (IMPORTANT)
            // =========================
            messages.put(new JSONObject()
                .put("role", "system")
                .put("content",
                    """
You are HoloRoom AI, an ecommerce assistant.

YOU MUST ALWAYS RETURN ONLY VALID JSON. NO TEXT BEFORE OR AFTER.

Allowed actions:
- search
- price
- top_selling
- most_wished
- navigate
- cancel
- none

JSON FORMAT:
{
  "action": "search|price|top_selling|most_wished|navigate|cancel|none",
  "type": "string or null",
  "min": number or null,
  "max": number or null,
  "message": "short user-friendly reply"
}

RULES:
- If user mentions search action with plural turn it into single like rugs -> rug/ tables -> table → action = search
- If user mentions cancel / go back / unapply/ remove filter(s) → action = cancel
- If user mentions cheap / budget / low price → action = price with min/max
- If user mentions expensive → price high range
- If user wants best selling → top_selling
- If user wants best reviewed products → reviews
- If user wants best most wished products → most_wished
- If user wants best selling → top_selling
- If user wants best discounts → discounts
- If user wants wishlist/profile/cart/shop → navigate
- If unclear → action = none
- NEVER include markdown
- NEVER include explanations
- ONLY JSON
"""
                )
            );

            // =========================
            // HISTORY (LAST 6 MESSAGES ONLY)
            // =========================
            if (history != null && !history.isEmpty()) {

                int start = Math.max(0, history.size() - 6);
                List<Message> lastMessages = history.subList(start, history.size());

                for (Message msg : lastMessages) {
                    if (msg == null || msg.text == null) continue;

                    messages.put(new JSONObject()
                        .put("role", "user".equals(msg.role) ? "user" : "assistant")
                        .put("content", msg.text)
                    );
                }
            }

            // =========================
            // CURRENT MESSAGE
            // =========================
            messages.put(new JSONObject()
                .put("role", "user")
                .put("content", message)
            );

            requestBody.put("messages", messages);

            HttpEntity<String> request =
                new HttpEntity<>(requestBody.toString(), headers);

            ResponseEntity<String> response =
                restTemplate.postForEntity(URL, request, String.class);

            JSONObject json = new JSONObject(response.getBody());

            String content = json
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content");

            // =========================
            // CLEAN OUTPUT (VERY IMPORTANT)
            // =========================
            content = content.trim();

            // remove accidental markdown blocks
            content = content.replace("```json", "").replace("```", "").trim();

            // validate JSON
            new JSONObject(content);

            return content;

        } catch (Exception e) {
            e.printStackTrace();

            return "{\"action\":\"none\",\"type\":\"none\",\"message\":\"Service error\"}";
        }
    }
}