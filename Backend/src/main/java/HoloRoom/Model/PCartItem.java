package HoloRoom.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cartitem")
public class PCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("cartItemId")
    private Long cartItemId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Products product;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    private PCart cart;

    @JsonProperty("quantity")
    private int quantity;

    public PCartItem() {}

    public PCartItem(Products product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    @JsonProperty("cartItemId")
    public Long getCartItemId() { return cartItemId; }
    public void setCartItemId(Long cartItemId) { this.cartItemId = cartItemId; }

    @JsonIgnore
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getProductId() : null;
    }

    public PCart getCart() { return cart; }
    public void setCart(PCart cart) { this.cart = cart; }

    @JsonProperty("quantity")
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

}
