package HoloRoom.Controller;

import HoloRoom.Service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> request) {
        List<Map<String, Object>> history = (List<Map<String, Object>>) request.get("history");
        String reply = chatbotService.chat(history);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}