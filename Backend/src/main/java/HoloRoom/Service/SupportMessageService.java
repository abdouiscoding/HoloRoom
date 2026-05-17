package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.SupportMessage;
import HoloRoom.Repository.SupportMessageRepository;

@Service
public class SupportMessageService {

    @Autowired
    private SupportMessageRepository supportMessageRepository;

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
}
