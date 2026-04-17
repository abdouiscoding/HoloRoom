package HoloRoom.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import HoloRoom.Model.User;
import HoloRoom.Repository.UserRepository;
import HoloRoom.Security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // REGISTER
    public String register(User user) {

        if (userRepository.findByUserName(user.getUserName()).isPresent()) {
            return "Username already exists";
        }

        if (userRepository.findByUserEmail(user.getUserEmail()).isPresent()) {
            return "An account with that email already exists";
        }

        // hash password
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        user.setUserRole("USER");

        userRepository.save(user);

        return "User registered successfully";
    }

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
}