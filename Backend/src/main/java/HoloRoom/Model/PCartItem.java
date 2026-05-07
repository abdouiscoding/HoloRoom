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

    @JsonProperty("pId")
    private long pId;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    private PCart cart;

    @ManyToOne
    @JoinColumn(name = "pscs_Id")
    private PSizeColorStock ProductSizeColorStock;

    @JsonProperty("name")
    private String name;

    @JsonProperty("image")
    private String image;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("size")
    private String size;

    @JsonProperty("color")
    private String color;

    @JsonProperty("ARSupport")
    private boolean ARSupport;

    @JsonProperty("stock")
    private int stock;

    @JsonProperty("price")
    private float price;

    @JsonProperty("subtotal")
    private float subtotal;

    public PCartItem() {}

    public PCartItem(Products product, PSizeColorStock pscs, String image, String size, String color,int stock, float price, int quantity, float subtotal) {
        this.product = product;
        this.pId = product.getProductId();
        this.name = product.getProductName();
        this.ProductSizeColorStock = pscs;
        this.image = image;
        this.size = size;
        this.color = color;
        this.price = price;
        this.stock = stock;
        this.ARSupport = product.isProductARSupport();
        this.quantity = quantity;
        this.subtotal = subtotal;
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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImage() { return image; }
    public void setImage(String pImageId) { this.image = pImageId; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public float getPrice() { return price; }
    public void setPrice(float price) { this.price = price; }

    public PCart getCart() { return cart; }
    public void setCart(PCart cart) { this.cart = cart; }

    public boolean isARSupport() { return ARSupport; }
    public void setARSupport(boolean ARSupport) { this.ARSupport = ARSupport; }

    @JsonProperty("quantity")
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    @JsonProperty("subtotal")
    public float getSubtotal() { return subtotal; }
    public void setSubtotal(float subtotal) { this.subtotal = subtotal; }

}
