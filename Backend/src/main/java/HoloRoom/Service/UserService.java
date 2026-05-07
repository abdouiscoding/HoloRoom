package HoloRoom.Service;



import java.net.InetAddress;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.nio.file.StandardCopyOption;

import java.util.List;

import java.util.Map;
import java.util.Optional;
import java.util.Random;

import java.util.concurrent.ConcurrentHashMap;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.SimpleMailMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;



import HoloRoom.Model.User;

import HoloRoom.Repository.UserRepository;
import HoloRoom.Security.JwtUtil;



@Service

public class UserService {



    @Autowired
    private UserRepository userrepo;



    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    @Autowired
    UserRepository userRepository;



    @Autowired
    private JavaMailSender mailSender;

    private final Map<String, User> pendingUsers = new ConcurrentHashMap<>();

    private final Map<String, String> registrationCodes = new ConcurrentHashMap<>();

    private final Map<Long, Map<String, VerificationEntry>> verificationCodes = new ConcurrentHashMap<>();



    private static final String UPLOAD_DIR =

        "C:\\Users\\abder\\Desktop\\HoloRoom\\Backend\\src\\main\\java\\HoloRoom\\Uploads\\Uimages";




    // =====================================

    // BASIC CRUD

    // =====================================



    public List<User> getAllUsers() {

        List<User> users = userrepo.findAll();

        users.forEach(this::buildUserImage);

        return users;

    }



    public void saveUser(User user) {
    if (user.getUserPassword() != null &&
        !user.getUserPassword().startsWith("$2a$")) {
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
    }
    userrepo.save(user);
}

    public void createUser(User user) {
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        applyDefaultImage(user);
        userrepo.save(user);
    }



    public User getUserById(Long id) {

        User user = userrepo.findById(id).orElse(null);

        return buildUserImage(user);

    }



    public User getUserByNameOrEmail(String info) {

        User user = userrepo.findByUserName(info).orElse(null);



        if (user == null) {

            user = userrepo.findByUserEmail(info).orElse(null);

        }



        return buildUserImage(user);

    }



    public void deleteUser(Long id) {

        userrepo.deleteById(id);

    }



        @Autowired
    private JwtUtil jwtUtil;
    
    // LOGIN
    public Object login(String info, String password) {

    info = info.trim();
    password = password.trim();

    Optional<User> userOpt =
        userRepository.findByUserEmail(info);

    if (userOpt.isEmpty()) {
        userOpt = userRepository.findByUserName(info);
    }

    if (userOpt.isEmpty()) {
        return "Invalid password or email/username";
    }
    User user = userOpt.get();

    if (!passwordEncoder.matches(password, user.getUserPassword())) {
        return "Invalid password or email/username";
    }

    return jwtUtil.generateToken(user);
}


   



    // =====================================

    // EMAIL CODE METHODS

    // =====================================



    public void sendRegisterCode(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());


    String code = String.valueOf(100000 + new Random().nextInt(900000));



    registrationCodes.put(user.getUserEmail(), code);

    message.setSubject("HoloRoom Registration Code");

    String username = user.getUserName(); 


    message.setText(

        "Hello, "+username+" \n\n" +

        "Your registration code is:\n\n" +

        code + "\n\n" +

        "This code expires in 10 minutes.\n\n" +

        "If this wasn't you, ignore this email."

    );



    mailSender.send(message);

    }



    public String startRegistration(User user) {

    if (userrepo.findByUserName(user.getUserName()).isPresent()) {
            return "Username already exists";
        }
    
    if (userrepo.findByUserEmail(user.getUserEmail()).isPresent()) {

        return "Email already exists";

    }



    applyDefaultImage(user);

    user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));

    user.setUserRole("USER");



    pendingUsers.put(user.getUserEmail(), user);



    sendRegisterCode(user);



    return "Verification code sent";

    }



    public String confirmRegistration(String email, String code) {



    String savedCode = registrationCodes.get(email);



    if (savedCode == null)

        return "Code expired or not found";



    if (!savedCode.equals(code)) {



        registrationCodes.remove(email);

        pendingUsers.remove(email);



        return "Invalid code";

    }



    User user = pendingUsers.get(email);



    if (user == null) {
    return "User not found";
    }


    user.setActive(true);
    user.setShipping("None");
    userrepo.save(user);



    pendingUsers.remove(email);

    registrationCodes.remove(email);
    return "User registered successfully";

    }



    public void clearRegistration(String email) {

    pendingUsers.remove(email);

    registrationCodes.remove(email);

    }



   public void sendVerificationCode(User user, String type) {

    String code = String.valueOf(100000 + new Random().nextInt(900000));

    long expiresAt = System.currentTimeMillis() + (10 * 60 * 1000); // 10 min

    verificationCodes
        .computeIfAbsent(user.getUserId(), k -> new ConcurrentHashMap<>())
        .put(type, new VerificationEntry(code, expiresAt));

    SimpleMailMessage message = new SimpleMailMessage();

    String link;

    String username = user.getUserName(); 

    if ("email".equals(type)) {
        link = "http://" + getCurrentIp() + ":5173/changeemail?email=" + user.getUserEmail();
        message.setSubject("HoloRoom Email Change Verification");

        message.setText(
            "Hello, "+username+"\n\n" +
            "Your EMAIL change code is:\n\n" +
            code + "\n\n" +
            "This code expires in 10 minutes.\n\n" +
            "Open this link:\n" +
            link
        );

    } else {
        link = "http://" + getCurrentIp() + ":5173/changepassword?email=" + user.getUserEmail();
        message.setSubject("HoloRoom Password Change Verification");

        message.setText(
            "Hello, "+username+"\n\n" +
            "Your PASSWORD change code is:\n\n" +
            code + "\n\n" +
            "This code expires in 10 minutes.\n\n" +
            "Open this link:\n" +
            link
        );
    }

    message.setTo(user.getUserEmail());
    mailSender.send(message);
}

   public boolean verifyCode(Long userId, String code, String type) {

    Map<String, VerificationEntry> userCodes = verificationCodes.get(userId);

    if (userCodes == null) return false;

    VerificationEntry entry = userCodes.get(type);

    if (entry == null) return false;

    if (System.currentTimeMillis() > entry.expiresAt) {
        userCodes.remove(type);
        return false;
    }

    if (!entry.code.equals(code)) return false;

    userCodes.remove(type);

    return true;
}

    // =====================================

    // IMAGE URL BUILDING

    // =====================================



    private String getCurrentIp() {

        try {

            return InetAddress

                .getLocalHost()

                .getHostAddress();

        } catch (Exception e) {

            return "localhost";

        }

    }



    private String getBaseUrl() {

        return "http://" +

            getCurrentIp() +

            ":8080/api/uploads/uimages/";

    }



public User buildUserImage(User user) {

    if (user == null)
        return null;

    if (user.getUserImage() != null &&
        !user.getUserImage().equals("null")) {

        String image = user.getUserImage();

        // keep only filename
        if (image.contains("/")) {
            image = image.substring(image.lastIndexOf("/") + 1);
        }

        String encodedFileName = URLEncoder.encode(
            image,
            StandardCharsets.UTF_8
        ).replace("+", "%20");

        user.setUserImage(
            getBaseUrl() + encodedFileName
        );
    }

    return user;
}



    // =====================================

    // CREATE DEFAULT IMAGE

    // =====================================



    public void applyDefaultImage(User user) {



        if (user.getUserImage() == null ||

            user.getUserImage().isBlank()) {



            user.setUserImage("default.png");

        }

    }



    // =====================================

    // UPDATE NAME

    // =====================================



    public User updateUserName(

            Long userId,

            String newName) {



        User user =

            userrepo.findById(userId).orElse(null);



        if (user == null)

            return null;



        user.setUserName(newName);



        return userrepo.save(user);

    }



    // =====================================

    // UPDATE EMAIL

    // =====================================



    public User updateUserEmail(

            Long userId,

            String newEmail) {



        User user =

            userrepo.findById(userId).orElse(null);



        if (user == null)

            return null;



        user.setUserEmail(newEmail);



        return userrepo.save(user);

    }



    // =====================================

    // UPDATE PASSWORD

    // =====================================



    public User updateUserPassword(

            Long userId,

            String newPassword) {



        User user =

            userrepo.findById(userId).orElse(null);



        if (user == null)

            return null;



        user.setUserPassword(

            passwordEncoder.encode(newPassword)

        );



        return userrepo.save(user);

    }



    // =====================================

    // UPDATE SHIPPING

    // =====================================



    public User updateShipping(

            Long userId,

            String shipping) {



        User user =

            userrepo.findById(userId).orElse(null);



        if (user == null)

            return null;



        user.setShipping(shipping);



        return userrepo.save(user);

    }



    // =====================================

    // UPDATE IMAGE

    // =====================================



    public User updateUserImage(

            Long userId,

            MultipartFile file) throws Exception {



        User user =

            userrepo.findById(userId).orElse(null);



        if (user == null)

            return null;



        String fileName =

            System.currentTimeMillis() +

            "_" +

            file.getOriginalFilename();



        Path uploadPath =

            Paths.get(UPLOAD_DIR);



        if (!Files.exists(uploadPath)) {

            Files.createDirectories(uploadPath);

        }



        Path path =

            uploadPath.resolve(fileName);



        Files.copy(

            file.getInputStream(),

            path,

            StandardCopyOption.REPLACE_EXISTING

        );



        user.setUserImage(fileName);



        userrepo.save(user);



        return buildUserImage(user);

    }

    private static class VerificationEntry {
    String code;
    long expiresAt;

    VerificationEntry(String code, long expiresAt) {
        this.code = code;
        this.expiresAt = expiresAt;
    }
}

}