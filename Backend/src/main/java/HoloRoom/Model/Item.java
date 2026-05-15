package HoloRoom.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private Long pId;
    private String name;
    private float price;
    private int quantity;
    private PSizeColorStock productSizeColorStock;
    private float totalPrice;

    @ManyToOne
    @JoinColumn(name = "orders_item_id")
    private OrdersItem ordersItem;

    // Constructors
    public Item() {}
    public Item(Long pId, String name, float price, int quantity, PSizeColorStock productSizeColorStock) {
        this.pId = pId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.productSizeColorStock = productSizeColorStock;
        this.totalPrice = price * quantity;
    }

    // Getters and Setters
    public Long getPId() { return pId; }
    public void setPId(Long pId) { this.pId = pId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public float getPrice() { return price; }
    public void setPrice(float price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public float getTotalPrice() { return totalPrice; }
    
    public OrdersItem getOrdersItem() { return ordersItem; }
    public void setOrdersItem(OrdersItem ordersItem) { this.ordersItem = ordersItem; }

    public PSizeColorStock getProductSizeColorStock() { return productSizeColorStock; }
    public void setProductSizeColorStock(PSizeColorStock productSizeColorStock) { this.productSizeColorStock = productSizeColorStock; }
} 
