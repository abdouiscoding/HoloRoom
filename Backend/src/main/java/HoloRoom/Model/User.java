package HoloRoom.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String UserName;

    private String UserEmail;
    
    private String UserPassword;
    
    private String UserRole;  
    
    public User() {
    }
    
    public User(String userName, String userEmail, String userPassword, String role) {
        this.UserName = userName;
        this.UserEmail = userEmail;
        this.UserPassword = userPassword;
        this.UserRole = role;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return UserName;
    }
    
    public void setUsername(String userName) {
        this.UserName = userName;
    }
    
    public String getUserEmail() {
        return UserEmail;
    }

    public void setUserEmail(String userEmail) {
        this.UserEmail = userEmail;
    }
    
    public String getPassword() {
        return UserPassword;
    }
    
    public void setPassword(String userPassword) {
        this.UserPassword = userPassword;
    }
    
    public String getRole() {
        return UserRole;
    }
    
    public void setRole(String role) {
        this.UserRole = role;
    }
}