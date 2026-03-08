package HoloRoom.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "productsizecolor")
public class PSizeColors {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pscId")
    private Long pscId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference
    @JsonProperty("product")
    private Products product;

    @JsonProperty("pSize")
    private String pSize;

    @JsonProperty("pColor")
    private String pColor;

    public PSizeColors() {}

    public PSizeColors(Products product, String pSize, String pColor) {
        this.product = product;
        this.pSize = pSize;
        this.pColor = pColor;
    }

    @JsonProperty("pscId")
    public Long getPscId() { return pscId; }
    public void setPscId(Long pscId) { this.pscId = pscId; }

    @JsonProperty("product")
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonProperty("pSize")
    public String getProductSize() { return pSize; }
    public void setProductSize(String pSize) { this.pSize = pSize; }

    @JsonProperty("pColor")
    public String getProductColor() { return pColor; }
    public void setProductColor(String pColor) { this.pColor = pColor; }
}