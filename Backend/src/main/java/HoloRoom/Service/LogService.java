package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.Log;
import HoloRoom.Repository.LogRepository;

@Service
public class LogService {
    
    @Autowired
    private LogRepository logRepository;

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }

    public List<Log> getLogsByUserId(Long userId) {
        return logRepository.findByUserId(userId);
    }

    public Log getLogById(Long id) {
        return logRepository.findById(id).orElse(null);
    }

    public Log saveLog(Log log) {
        return logRepository.save(log);
    }

    public void deleteLog(Long id) {
        logRepository.deleteById(id);
    }
}
