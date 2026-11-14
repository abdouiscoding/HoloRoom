package HoloRoom.Model;

import java.sql.Date;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String userName;
    private String userEmail;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String userPassword;
    private String userImage;

    private boolean active;

    private String shipping;

    private LocalDateTime creationdate;

    private LocalDateTime lastactive;

    private String userRole;

    public User() {}

    public User(String userName, String userEmail, String userPassword, String userRole) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPassword = userPassword;
        this.userRole = userRole;  
    }

    @PrePersist
    protected void onCreate() {
        if (this.shipping == null) this.shipping = "None";
        if (this.userImage == null)
            this.userImage = "default.png";
        if (this.creationdate == null)
            this.creationdate = LocalDateTime.now();
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

    public LocalDateTime getCreationdate() { return creationdate; }

    public LocalDateTime getLastactive() { return lastactive; }
    public void setLastactive(LocalDateTime currentime) { this.lastactive = currentime; } 

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