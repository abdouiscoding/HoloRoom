package HoloRoom.Model;

import java.util.List;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "ordersitems")
public class OrdersItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("oItemId")
    private Long oItemId;

    @JsonProperty("Items")
    @OneToMany(mappedBy = "ordersItem", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Item> items;

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

    public OrdersItem(List<Item> items, Long userId) {
        this.items = items;
        if (items != null) {
            for (Item item : items) {
                item.setOrdersItem(this);
            }
        }
        this.price = items.stream().map(item -> item.getTotalPrice()).reduce(0f, Float::sum);
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

    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { 
        this.items = items;
        if (items != null) {
            for (Item item : items) {
                item.setOrdersItem(this);
            }
        }
    }
    
}
