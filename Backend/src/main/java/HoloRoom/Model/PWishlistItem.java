package HoloRoom.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "WishlistItems")
public class PWishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("wItemId")
    private Long wItemId;

    @JsonProperty("pId")
    private Long pId;

    @JsonProperty("quantity")
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "wishlist_id")
    @JsonBackReference
    private PWishlist wishlist;

    public PWishlistItem() {}

    public PWishlistItem(Long pId, int quantity) {
        this.pId = pId;
        this.quantity = quantity;
    }

    @JsonProperty("wItemId")
    public Long getwItemId() { return wItemId; }
    public void setwItemId(Long wItemId) { this.wItemId = wItemId; }

    @JsonProperty("quantity")
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    @JsonProperty("pId")
    public Long getpId() { return pId; }
    public void setpId(Long pId) { this.pId = pId; }

    public PWishlist getWishlist() { return wishlist; }
    public void setWishlist(PWishlist wishlist) { this.wishlist = wishlist; }
}

