package HoloRoom.Model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "wishlists")
public class PWishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("wId")
    private Long wId;

    @JsonProperty("wName")
    private String wName;

    @JsonProperty("userId")
    private Long userId;

    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PWishlistItem> wishlistItems;

    public PWishlist() {}

    public PWishlist(String wName, Long userId, List<PWishlistItem> wishlistItems) {
        this.wName = wName;
        this.userId = userId;
        this.wishlistItems = wishlistItems;
    }

    @JsonProperty("wId")
    public Long getwId() { return wId; }
    public void setwId(Long wId) { this.wId = wId; }

    @JsonProperty("wName")
    public String getwName() { return wName; }
    public void setwName(String wName) { this.wName = wName; }

    @JsonProperty("userId")
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<PWishlistItem> getWishlistItems() { return wishlistItems; }
    public void setWishlistItems(List<PWishlistItem> wishlistItems) { this.wishlistItems = wishlistItems; }
}