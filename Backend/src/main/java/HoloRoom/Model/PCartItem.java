package HoloRoom.Model;

import java.math.BigDecimal;

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

    @ManyToOne
    @JoinColumn(name = "pscs_Id")
    private PSizeColorStock ProductSizeColorStock;

    @JsonProperty("image")
    private String image;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("size")
    private String size;

    @JsonProperty("color")
    private String color;

    @JsonProperty("price")
    private BigDecimal price;

    public PCartItem() {}

    public PCartItem(Products product, PSizeColorStock pscs, String image, String size, String color, BigDecimal price, int quantity) {
        this.product = product;
        this.ProductSizeColorStock = pscs;
        this.image = image;
        this.size = size;
        this.color = color;
        this.price = price;
        this.quantity = quantity;
    }

    @JsonProperty("cartItemId")
    public Long getCartItemId() { return cartItemId; }
    public void setCartItemId(Long cartItemId) { this.cartItemId = cartItemId; }

    @JsonIgnore
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonIgnore
    public PSizeColorStock getPscs() {
        return ProductSizeColorStock;
    }

    public String getImage() { return image; }
    public void setImage(String pImageId) { this.image = pImageId; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public PCart getCart() { return cart; }
    public void setCart(PCart cart) { this.cart = cart; }

    @JsonProperty("quantity")
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

}
