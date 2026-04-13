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
@Table(name = "cart")
public class PCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pCartId")
    private Long pCartId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Products> products;

    public PCart() {}

    public PCart(List<Products> products) {
        this.products = products;
    }

    @JsonProperty("pCartId")
    public Long getCartId() { return pCartId; }
    public void setCartId(Long pCartId) { this.pCartId = pCartId; }

    @JsonProperty("products")
    public List<Products> getProducts() { return products; }
    public void setProducts(List<Products> products) { this.products = products; }

}