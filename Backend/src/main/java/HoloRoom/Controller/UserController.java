package HoloRoom.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.User;
import HoloRoom.Service.UserService;

@RestController
@RequestMapping("/api/Users")
public class UserController {
    
    @Autowired
    private UserService UserService;
    
    // GET: Retrieve all Users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = UserService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // GET: Retrieve a single User by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = UserService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    // POST: Create a new user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        UserService.saveUser(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }
    
    // PUT: Update an existing user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, 
                                                @RequestBody User userDetails) {
        User user = UserService.getUserById(id);
        if (user != null) {
            user.setUserName(userDetails.getUserName());
            user.setUserEmail(userDetails.getUserEmail());
            user.setUserPassword(userDetails.getUserPassword());
            user.setUserRole(userDetails.getUserRole());
            UserService.saveUser(user);
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    // DELETE: Delete a student by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        User user = UserService.getUserById(id);
        if (user != null) {
            UserService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}