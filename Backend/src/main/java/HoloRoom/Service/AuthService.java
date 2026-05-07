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
    System.out.println("expecting"+user.getUserName()+"and got from user"+info);
    System.out.println("expecting"+user.getUserPassword()+"and got from user"+password+"encoded into:"+passwordEncoder.encode(password));
    System.out.println(passwordEncoder.matches(password, user.getUserPassword()));

    if (!passwordEncoder.matches(password, user.getUserPassword())) {
        return "Invalid password or email/username";
    }

    return jwtUtil.generateToken(user);
}
}