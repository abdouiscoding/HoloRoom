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

    @JsonProperty("productId")
    private Long productId;

    @JsonProperty("quantity")
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "wishlist_id")
    @JsonBackReference
    private PWishlist wishlist;

    public PWishlistItem() {}

    public PWishlistItem(Long productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    @JsonProperty("wItemId")
    public Long getwItemId() { return wItemId; }
    public void setwItemId(Long wItemId) { this.wItemId = wItemId; }

    @JsonProperty("productId")
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    @JsonProperty("quantity")
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public PWishlist getWishlist() { return wishlist; }
    public void setWishlist(PWishlist wishlist) { this.wishlist = wishlist; }
}

