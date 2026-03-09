package HoloRoom.Model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class PCategories {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pcaId")
    private Long pcaId;

    @JsonProperty("pCategory")
    private String pCategory;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private List<Products> products;

    public PCategories() {}

    public PCategories(String pCategory) {
        this.pCategory = pCategory;
    }

    @JsonProperty("pcaId")
    public Long getPcId() { return pcaId; }
    public void setPcId(Long pcaId) { this.pcaId = pcaId; }

    @JsonProperty("pCategory")
    public String getProductCategory() { return pCategory; }
    public void setProductCategory(String pCategory) { this.pCategory = pCategory; }

    @JsonProperty("products")
    public List<Products> getProducts() { return products; }
    public void setProducts(List<Products> products) { this.products = products; }
}