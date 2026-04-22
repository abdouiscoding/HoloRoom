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
@Table(name = "productimages")
public class PImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pImageId")
    private Long pImageId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference
    private Products product;

    @JsonProperty("pImageUrl")
    private String pImageUrl;

    public PImages() {}

    public PImages(Products product, String pImageUrl) {
        this.product = product;
        this.pImageUrl = pImageUrl;
    }

    @JsonProperty("pImageId")
    public Long getImageId() { return pImageId; }
    public void setImageId(Long pImageId) { this.pImageId = pImageId; }

    @JsonProperty("product")
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonProperty("pImageUrl")
    public String getProductImage() { return pImageUrl; }
    public void setProductImage(String pImageUrl) { this.pImageUrl = pImageUrl; }
}