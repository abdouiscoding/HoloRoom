package HoloRoom.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import HoloRoom.Model.User;
import HoloRoom.Repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) {

        if (userRepository.findByUserName("admin").isEmpty()) {

            User admin = new User();
            admin.setUserName("admin");
            admin.setUserEmail("abderahim.ferdi1@gmail.com");
            admin.setUserPassword(encoder.encode("admin123"));
            admin.setActive(true);
            admin.setUserRole("ADMIN");

            userRepository.save(admin);
        }
    }
}
