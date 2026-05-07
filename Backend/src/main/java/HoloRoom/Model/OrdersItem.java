package HoloRoom.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "ordersitems")
public class OrdersItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("oItemId")
    private Long oItemId;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    private PCart cart;
    
    @JsonProperty("pCartId")
    private Long pCartId;

    @JsonProperty("price")
    private float price;
    
    @JsonProperty("Status")
    private String Status;

    @JsonProperty("orderDate")
    private LocalDateTime orderDate;

    @JsonProperty("userId")
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Orders order;

    // Constructors
    public OrdersItem() {}

    public OrdersItem(PCart cart, Long userId) {
        this.cart = cart;
        this.price = cart.getTotal();
        this.Status = "Pending";
        this.userId = userId;
        this.orderDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getoItemId() { return oItemId; }
    public void setoItemId(Long oItemId) { this.oItemId = oItemId; }

    public float getPrice() { return price; }
    public void setPrice(float price) { this.price = price; }

    public Orders getOrder() { return order; }
    public void setOrder(Orders order) { this.order = order; }

    public String getStatus() { return Status; }
    public void setStatus(String status) { this.Status = status; }

    public LocalDateTime getOrderDate() { return orderDate; }

    public PCart getCart() { return cart; } // Added getter for cart
    public void setCart(PCart cart) { this.cart = cart; } // Added setter for cart

    @JsonProperty("cId")
    public Long getCartId() {
        return cart != null ? cart.getCartId() : null;
    }
    
}