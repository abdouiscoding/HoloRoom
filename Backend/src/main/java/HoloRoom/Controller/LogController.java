package HoloRoom.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.Log;
import HoloRoom.Service.LogService;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping("/all")
    public ResponseEntity<List<Log>> getAllLogs() {
        return ResponseEntity.ok(logService.getAllLogs());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Log>> getLogsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(logService.getLogsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Log> getLogById(@PathVariable Long id) {
        Log log = logService.getLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Log> createLog(@RequestBody Log log) {
        Log createdLog = logService.saveLog(log);
        return ResponseEntity.status(201).body(createdLog);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        logService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
