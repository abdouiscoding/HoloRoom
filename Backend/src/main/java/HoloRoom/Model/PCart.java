package HoloRoom.Model;

import java.math.BigDecimal;
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
@Table(name = "cart")
public class PCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pCartId")
    private Long pCartId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PCartItem> items;

    @JsonProperty("total")
    private BigDecimal Total;

    @JsonProperty("userId")
    private String userId;

    public PCart() {}

    public PCart(List<PCartItem> items , BigDecimal total, String userId) {
        this.items = items;
        this.Total = total;
        this.userId = userId;
    }

    @JsonProperty("pCartId")
    public Long getCartId() { return pCartId; }
    public void setCartId(Long pCartId) { this.pCartId = pCartId; }

    @JsonProperty("items")
    public List<PCartItem> getItems() { return items; }
    public void setItems(List<PCartItem> items) { this.items = items; }

    @JsonProperty("total")
    public BigDecimal getTotal() { return Total; }  
    public void setTotal(BigDecimal total) { Total = total; }

    @JsonProperty("userId")
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

}