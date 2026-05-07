package HoloRoom.Model;
import jakarta.persistence.*;

@Entity
@Table(name = "discounts")
public class Discounts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int percentage;

    private boolean active;

    private Long productId;

    public Discounts(String name, int percentage, boolean active, Long productId) {
        this.name=name;
        this.percentage=percentage;
        this.active=active;
        this.productId=productId;
    }

    public Discounts(String name, int percentage, boolean active) {
        this.name=name;
        this.percentage=percentage;
        this.active=active;
    }
    
    public Discounts() {
        
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPercentage() {
        return percentage;
    }

    public void setPercentage(int percentage) {
        this.percentage = percentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}