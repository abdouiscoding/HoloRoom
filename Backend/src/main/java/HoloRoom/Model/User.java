package HoloRoom.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String userName;
    private String userEmail;
    private String userPassword;
    private String userImage;

    // Use primitive boolean to ensure it defaults to false
    private boolean active;

    private String shipping;
    private String userRole;

    public User() {}

    public User(String userName, String userEmail, String userPassword, String userRole) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPassword = userPassword;
        this.shipping = "None";
        this.userImage = "default.png";
        this.active = false; // Explicitly set to false on creation
        this.userRole = userRole;  
    }

    // Standard Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserPassword() { return userPassword; }
    public void setUserPassword(String userPassword) { this.userPassword = userPassword; }

    // Standard naming for boolean getters is "is..."
    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getShipping() { return shipping; }
    public void setShipping(String shipping) { this.shipping = shipping; }

    public String getUserImage () { return userImage; }
    public void setUserImage (String userImage) { this.userImage = userImage; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
}