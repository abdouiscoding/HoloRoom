package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import HoloRoom.Model.SupportMessage;
import HoloRoom.Model.User;
import HoloRoom.Repository.SupportMessageRepository;

@Service
public class SupportMessageService {

    @Autowired
    private SupportMessageRepository supportMessageRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserService userService;

    @Value("${spring.mail.username:support@holoroom.app}")
    private String fromAddress;

    public void sendSupportResponse(String to, String userName, String topic,
                                    String originalMessage, String response) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Re: " + topic + " — HoloRoom Support");
        msg.setText(
            "Hello " + (userName != null ? userName : "there") + ",\n\n" +
            "Thank you for contacting HoloRoom Support. Here is our response to your ticket:\n\n" +
            "---\n" + response + "\n---\n\n" +
            "Your original message:\n" + originalMessage + "\n\n" +
            "If you need anything else, just reply to this email or open another ticket.\n\n" +
            "— HoloRoom Support Team"
        );
        mailSender.send(msg);
    }

    public SupportMessage respondToMessage(Long id, String responseText) {
        SupportMessage msg = getSupportMessageById(id);
        if (msg == null) return null;

        User user = userService.getUserById(msg.getUserId());
        if (user == null || user.getUserEmail() == null) {
            throw new IllegalStateException("Recipient user or email missing");
        }

        sendSupportResponse(
            user.getUserEmail(),
            user.getUserName(),
            msg.getTopic(),
            msg.getMessage(),
            responseText
        );

        msg.setStatus("Responded");
        return supportMessageRepository.save(msg);
    }

    public SupportMessage saveSupportMessage(SupportMessage supportMessage) {
        return supportMessageRepository.save(supportMessage);
    }

    public SupportMessage getSupportMessageById(Long id) {
        return supportMessageRepository.findById(id).orElse(null);
    }

    public void deleteSupportMessage(Long id) {
        supportMessageRepository.deleteById(id);
    }

    public List<SupportMessage> getAllSupportMessages() {
        return supportMessageRepository.findAll();
    }

    public SupportMessage updateStatus (Long id, String status) {
        SupportMessage supportMessage = getSupportMessageById(id);
        if (supportMessage != null) {
            supportMessage.setStatus(status);
            return supportMessageRepository.save(supportMessage);
        }
        return null;
    }

    public List<SupportMessage> getSupportMessagesByUserId(Long userId) {
        return supportMessageRepository.findAll().stream()
                .filter(msg -> msg.getUserId().equals(userId))
                .toList();
    }
}
