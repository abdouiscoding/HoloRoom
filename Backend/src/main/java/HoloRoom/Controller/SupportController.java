package HoloRoom.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.SupportMessage;
import HoloRoom.Service.SupportMessageService;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    @Autowired
    private SupportMessageService supportMessageService;

    @GetMapping("/messages")
    public List<SupportMessage> getAllSupportMessages() {
        return supportMessageService.getAllSupportMessages(); 
    }

    @PostMapping("/messages/create")
    public SupportMessage createSupportMessage(@RequestBody SupportMessage supportMessage) {
        return supportMessageService.saveSupportMessage(supportMessage);
    }

    @PostMapping("/messages/delete")
    public void deleteSupportMessage(@RequestBody Long id) {
        supportMessageService.deleteSupportMessage(id);
    }

    @PostMapping("/messages/updateStatus")
    public SupportMessage updateSupportMessageStatus(@RequestBody SupportMessage supportMessage) {
        return supportMessageService.updateStatus(supportMessage.getId(), supportMessage.getStatus());
    }
}
