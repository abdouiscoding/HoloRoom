package HoloRoom.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "productsizecolorstock")
public class PSizeColorStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pscsId")
    private Long pscsId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference
    private Products product;

    @JsonProperty("pSize")
    private String pSize;

    @JsonProperty("pColor")
    private String pColor;

    @JsonProperty("pStock")
    private int pStock;

    @OneToMany(mappedBy = "productSizeColorStock", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonProperty("images")
    private List<PImages> images = new ArrayList<>();

    public PSizeColorStock() {}

    public PSizeColorStock(Products product, String pSize, String pColor, int pStock) {
        this.product = product;
        this.pSize = pSize;
        this.pColor = pColor;
        this.pStock = pStock;
    }

    @JsonProperty("pscsId")
    public Long getPscsId() { return pscsId; }
    public void setPscsId(Long pscsId) { this.pscsId = pscsId; }

    @JsonIgnore
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonIgnore
    public List<PImages> getImages() { return images; }
    public void setImages(List<PImages> images) { this.images = images; }

    @JsonProperty("pSize")
    public String getProductSize() { return pSize; }
    public void setProductSize(String pSize) { this.pSize = pSize; }

    @JsonProperty("pColor")
    public String getProductColor() { return pColor; }
    public void setProductColor(String pColor) { this.pColor = pColor; }

    @JsonProperty("pStock")
    public int getProductStock() { return pStock; }
    public void setProductStock(int pStock) { this.pStock = pStock; }
}