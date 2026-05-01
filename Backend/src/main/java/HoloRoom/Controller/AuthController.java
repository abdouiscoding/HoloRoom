package HoloRoom.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import HoloRoom.Model.User;
import HoloRoom.Service.AuthService;
import HoloRoom.Service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    // REGISTER - STEP 1: START (Send Code)
    @PostMapping("/register/start")
    public ResponseEntity<?> startRegistration(@RequestBody User user) {
        String result = userService.startRegistration(user);
        Map<String, Object> response = new HashMap<>();

        if (result.equals("Verification code sent")) {
            response.put("success", true);
            response.put("message", result);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", result);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // REGISTER - STEP 2: CONFIRM (Verify Code)
    @PostMapping("/register/confirm")
    public ResponseEntity<?> confirmRegistration(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        String result = userService.confirmRegistration(email, code);
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

    // =====================================
    // LOGIN (With Active Account Check)
    // =====================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String info = request.get("info");
        String userPassword = request.get("userPassword");
        
        Map<String, Object> response = new HashMap<>();

        // 1. Fetch the user to check status
        User user = userService.getUserByNameOrEmail(info);

        // 2. Check if user is unconfirmed (Active = false)
        if (user != null && user.isActive() == false) {
            userService.deleteUser(user.getUserId());
            response.put("success", false);
            response.put("message", "Email was not confirmed. Your registration has been removed, please sign up again.");
            return ResponseEntity.status(403).body(response);
        }

        // 3. Proceed with standard login via AuthService
        Object result = authService.login(info, userPassword);

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