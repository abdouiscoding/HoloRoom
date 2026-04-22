package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.User;
import HoloRoom.Repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository UserRepository;
    
    // Retrieve all users from database
    public List<User> getAllUsers() {
        return UserRepository.findAll();
    }
    
    // Save a new user or update existing one
    public void saveUser(User user) {
        UserRepository.save(user);
    }
    
    // Get a single user by ID
    public User getUserById(Long id) {
        return UserRepository.findById(id).orElse(null);
    }

    public User getUserByNameOrEmail(String info) {
        User user = UserRepository.findByUserName(info).orElse(null);
        if (user != null){
            return user;
        }
        return UserRepository.findByUserEmail(info).orElse(null);
    }
    
    // Delete a user by ID
    public void deleteUser(Long id) {
        UserRepository.deleteById(id);
    }
}