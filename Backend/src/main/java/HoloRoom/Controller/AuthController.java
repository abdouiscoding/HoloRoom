package HoloRoom.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import HoloRoom.Model.User;
import HoloRoom.Service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        String result = authService.register(user);

        Map<String, Object> response = new HashMap<>();

        if (result.equals("User registered successfully")) {
            response.put("success", true);
            response.put("message", result);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", result);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

    String info = request.get("info");
    String userPassword = request.get("userPassword");

    Object result = authService.login(info, userPassword);

    Map<String, Object> response = new HashMap<>();

    if (result instanceof String && ((String) result).contains(" ")) {
        response.put("success", false);
        response.put("message", result);
        return ResponseEntity.status(401).body(response);
    }

    response.put("success", true);
    response.put("token", result);

    return ResponseEntity.ok(response);
   }

   

}