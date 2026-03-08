package HoloRoom.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "productsizecolor")
public class PSizeColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pscId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference
    private Products product;

    private String pSize;

    private String pColor;

    public PSizeColor() {}

    public PSizeColor(Products product, String pSize, String pColor) {
        this.product = product;
        this.pSize = pSize;
        this.pColor = pColor;
    }

    public Long getPscId() {
        return pscId;
    }

    public void setPscId(Long pscId) {
        this.pscId = pscId;
    }

    public Products getProduct() {
        return product;
    }

    public void setProduct(Products product) {
        this.product = product;
    }

    public String getProductSize() {
        return pSize;
    }

    public void setProductSize(String pSize) {
        this.pSize = pSize;
    }

    public String getProductColor() {
        return pColor;
    }

    public void setProductColor(String pColor) {
        this.pColor = pColor;
    }
}