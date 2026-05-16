package HoloRoom.Controller;
import HoloRoom.Service.AIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private AIService aiService;

    @PostMapping("/ar")
    public ResponseEntity<Map<String, String>> arChat(@RequestBody Map<String, Object> body) {
        try {
            String message = (String) body.get("message");

            List<AIService.Message> history = new ArrayList<>();
            Object rawHistory = body.get("history");
            if (rawHistory instanceof List<?> list) {
                for (Object obj : list) {
                    if (obj instanceof Map<?, ?> map) {
                        AIService.Message m = new AIService.Message();
                        String role = (String) map.get("role");
                        m.role = role == null ? "user" : role;
                        m.text = (String) map.get("text");
                        history.add(m);
                    }
                }
            }

            String reply = aiService.askArHelper(message, history);
            if (reply == null || reply.isBlank()) {
                reply = "Sorry, I didn't catch that. Could you say it again?";
            }
            return ResponseEntity.ok(Map.of("reply", reply));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("reply", "Something went wrong on my end."));
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> body) {

        try {
            String message = (String) body.get("message");

            List<AIService.Message> history = new ArrayList<>();

            Object rawHistory = body.get("history");

            if (rawHistory instanceof List<?> list) {
                for (Object obj : list) {
                    if (obj instanceof Map<?, ?> map) {

                        AIService.Message m = new AIService.Message();

                        String role = (String) map.get("role");

                        // ✅ FORCE SAFE ROLE (prevents Gemini rejection)
                        m.role = (role == null) ? "user" : role;

                        m.text = (String) map.get("text");

                        history.add(m);
                    }
                }
            }
            System.out.println("MESSAGE RECEIVED: " + message);
            System.out.println("HISTORY SIZE: " + (history == null ? 0 : history.size()));

            String reply = aiService.askai(message, history);

            if (reply == null || reply.isBlank()) {
                reply = "{\"action\":\"none\",\"type\":\"none\",\"message\":\"Empty AI response\"}";
            }

            return ResponseEntity.ok(Map.of("reply", reply));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.ok(Map.of(
                    "reply",
                    "{\"action\":\"none\",\"type\":\"none\",\"message\":\"Server crashed\"}"
            ));
        }
    }
}