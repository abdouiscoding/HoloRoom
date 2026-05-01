package HoloRoom.Service;



import java.net.InetAddress;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.nio.file.StandardCopyOption;

import java.util.List;

import java.util.Map;

import java.util.Random;

import java.util.concurrent.ConcurrentHashMap;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.SimpleMailMessage;

import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;



import HoloRoom.Model.User;

import HoloRoom.Repository.UserRepository;



@Service

public class UserService {



    @Autowired

    private UserRepository userrepo;



    @Autowired

    private PasswordEncoder passwordEncoder;



    @Autowired

    private JavaMailSender mailSender;



    private final Map<String, User> pendingUsers = new ConcurrentHashMap<>();

    private final Map<String, String> registrationCodes = new ConcurrentHashMap<>();



    private static final String UPLOAD_DIR =

        "C:\\Users\\abder\\Desktop\\HoloRoom\\Backend\\src\\main\\java\\HoloRoom\\Uploads\\Uimages";



    // userId -> code

    private final Map<Long, String> verificationCodes =

        new ConcurrentHashMap<>();



    // =====================================

    // BASIC CRUD

    // =====================================



    public List<User> getAllUsers() {

        List<User> users = userrepo.findAll();

        users.forEach(this::buildUserImage);

        return users;

    }



    public void saveUser(User user) {

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



   



    // =====================================

    // EMAIL CODE METHODS

    // =====================================



    public void sendRegisterCode(User user) {



    String code = String.valueOf(100000 + new Random().nextInt(900000));



    registrationCodes.put(user.getUserEmail(), code);



    SimpleMailMessage message = new SimpleMailMessage();



    message.setTo(user.getUserEmail());

    message.setSubject("HoloRoom Registration Code");



    message.setText(

        "Hello,\n\n" +

        "Your registration code is:\n\n" +

        code + "\n\n" +

        "This code expires in 10 minutes.\n\n" +

        "If this wasn't you, ignore this email."

    );



    mailSender.send(message);

    }



    public String startRegistration(User user) {



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



    String code = String.valueOf(

        100000 + new Random().nextInt(900000)

    );



    verificationCodes.put(user.getUserId(), code);



    SimpleMailMessage message = new SimpleMailMessage();



    String email = user.getUserEmail();



    if ("email".equals(type)) {



        message.setTo(email);

        message.setSubject("HoloRoom Email Change Verification");



        message.setText(

            "Hello,\n\n" +

            "Your verification code to change your EMAIL is:\n\n" +

            code + "\n\n" +

            "This code expires in 10 minutes.\n\n" +

            "If you didn't request this, ignore this email."

        );



    } else if ("password".equals(type)) {



        message.setTo(email);

        message.setSubject("HoloRoom Password Change Verification");



        message.setText(

            "Hello,\n\n" +

            "Your verification code to change your PASSWORD is:\n\n" +

            code + "\n\n" +

            "This code expires in 10 minutes.\n\n" +

            "If you didn't request this, ignore this email."

        );



    } else {

        throw new IllegalArgumentException("Invalid verification type: " + type);

    }



    mailSender.send(message);

}



    public boolean verifyCode(Long userId, String code) {



        String savedCode =

            verificationCodes.get(userId);



        if (savedCode == null)

            return false;



        if (!savedCode.equals(code))

            return false;



        verificationCodes.remove(userId);



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

            !user.getUserImage().startsWith("http")) {



            user.setUserImage(

                getBaseUrl() + user.getUserImage()

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

}