package HoloRoom.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import HoloRoom.Model.User;
import HoloRoom.Service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================================
    // GET ALL USERS
    // =====================================

    @GetMapping("/get")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // =====================================
    // GET USER BY ID
    // =====================================

    @GetMapping("/get/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {

        User user = userService.getUserById(id);

        if (user == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(user);
    }

    // =====================================
    // GET USER BY EMAIL OR NAME
    // =====================================

    @GetMapping("/getbyinfo/{info}")
    public ResponseEntity<User> getByInfo(@PathVariable String info) {

        User user = userService.getUserByNameOrEmail(info);

        if (user == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(user);
    }

    // =====================================
    // CREATE USER
    // =====================================

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {

        userService.applyDefaultImage(user);

        user.setUserPassword(
            passwordEncoder.encode(user.getUserPassword())
        );

        userService.saveUser(user);

        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    // =====================================
    // SEND CONFIRMATION CODE
    // =====================================

    @PostMapping("/send-code/{email}")
    public ResponseEntity<?> sendCode(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {

    User user = userService.getUserById(id);

    if (user == null) {
        return ResponseEntity.notFound().build();
    }

    String type = body.get("type");

    if (type == null || (!type.equals("email") && !type.equals("password"))) {
        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "success", false,
                        "message", "Type must be 'email' or 'password'"
                ));
    }

    try {
        userService.sendVerificationCode(user, type);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Verification code sent"
                )
        );

    } catch (Exception e) {
        return ResponseEntity
                .status(500)
                .body(Map.of(
                        "success", false,
                        "message", "Failed to send verification code"
                ));
    }
}

    // =====================================
    // FULL UPDATE
    // =====================================

    @PutMapping("/update/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User details) {

        User user = userService.getUserById(id);

        if (user == null)
            return ResponseEntity.notFound().build();

        user.setUserName(details.getUserName());
        user.setUserEmail(details.getUserEmail());
        user.setShipping(details.getShipping());
        user.setUserRole(details.getUserRole());

        userService.saveUser(user);

        return ResponseEntity.ok(user);
    }

    // =====================================
    // UPDATE EMAIL (CODE REQUIRED)
    // =====================================

    @PutMapping("/update/email/{id}")
    public ResponseEntity<?> updateEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newEmail = body.get("userEmail");
        String code = body.get("code");

        if (!userService.verifyCode(id, code)) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Invalid code");
        }

        User user = userService.updateUserEmail(id, newEmail);

        if (user == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(user);
    }

    // =====================================
    // UPDATE NAME
    // =====================================

    @PutMapping("/update/name/{id}")
    public ResponseEntity<User> updateName(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userService.updateUserName(
            id,
            body.get("userName")
        );

        if (user == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(user);
    }

    // =====================================
    // UPDATE PASSWORD (CODE REQUIRED)
    // =====================================

    @PutMapping("/update/password/{id}")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String rawPassword = body.get("userPassword");
        String code = body.get("code");

        if (!userService.verifyCode(id, code)) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Invalid code");
        }

        User user = userService.getUserById(id);

        if (user == null)
            return ResponseEntity.notFound().build();

        user.setUserPassword(
            passwordEncoder.encode(rawPassword)
        );

        userService.saveUser(user);

        return ResponseEntity.ok("Password updated");
    }

    // =====================================
    // UPDATE SHIPPING
    // =====================================

    @PutMapping("/update/shipping/{id}")
    public ResponseEntity<User> updateShipping(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userService.updateShipping(
            id,
            body.get("shipping")
        );

        if (user == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(user);
    }

    // =====================================
    // UPDATE IMAGE
    // =====================================

    @PutMapping(
        value = "/update/image/{id}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {

            User user = userService.updateUserImage(id, file);

            if (user == null)
                return ResponseEntity.notFound().build();

            return ResponseEntity.ok(user);

        } catch (Exception e) {

            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload image");
        }
    }

    // =====================================
    // DELETE USER
    // =====================================

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        User user = userService.getUserById(id);

        if (user == null)
            return ResponseEntity.notFound().build();

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}