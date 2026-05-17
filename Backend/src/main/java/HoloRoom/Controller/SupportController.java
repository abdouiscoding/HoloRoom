package HoloRoom.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.SupportMessage;
import HoloRoom.Model.User;
import HoloRoom.Service.SupportMessageService;
import HoloRoom.Service.UserService;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    @Autowired
    private SupportMessageService supportMessageService;

    @Autowired
    private UserService userService;

    @GetMapping("/messages")
    public List<SupportMessage> getAllSupportMessages() {
        return supportMessageService.getAllSupportMessages(); 
    }

    @PostMapping("/messages/create")
    public SupportMessage createSupportMessage(@RequestBody SupportMessage supportMessage) {
        SupportMessage createdMessage = new SupportMessage( supportMessage.getTopic(), supportMessage.getTitle(), supportMessage.getMessage(), supportMessage.getUserId());
        createdMessage.setStatus("Open");
        return supportMessageService.saveSupportMessage(createdMessage);
    }

    @PostMapping("/messages/delete")
    public void deleteSupportMessage(@RequestBody Long id) {
        supportMessageService.deleteSupportMessage(id);
    }

    @PostMapping("/messages/updateStatus")
    public SupportMessage updateSupportMessageStatus(@RequestBody SupportMessage supportMessage) {
        return supportMessageService.updateStatus(supportMessage.getId(), supportMessage.getStatus());
    }

    @GetMapping("/message/{userId}")
    public List<SupportMessage> getSupportMessagesByUserId(@PathVariable Long userId) {
        return supportMessageService.getSupportMessagesByUserId(userId);
    }

    @PostMapping("/messages/respond/{id}")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String response = body.get("response");
        if (response == null || response.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Response cannot be empty"));
        }
        try {
            SupportMessage updated = supportMessageService.respondToMessage(id, response);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Email failed: " + e.getMessage()));
        }
    }
}
