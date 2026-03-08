package HoloRoom.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Products {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pId;

    private String pName;

    private BigDecimal pPrice;

    private String pBrand;

    private String p3DModel;

    private Integer pStock;

    private String pCategory;

    private String pDescription;

    private Boolean pStatus;
    
    private LocalDateTime pAddDate;

    @OneToMany(mappedBy = "product")
    @JsonManagedReference
    private List<PImages> images;

    @OneToMany(mappedBy = "product")
    @JsonManagedReference
    private List<PSizeColor> sizesColors;

    public Products() {}

    public Products(
        String pName, 
        BigDecimal pPrice, 
        String pBrand, 
        String p3DModel,
        Integer pStock, 
        String pCategory, 
        String pDescription,
        Boolean pStatus, 
        LocalDateTime pAddDate) {

        this.pName = pName;
        this.pPrice = pPrice;
        this.pBrand = pBrand;
        this.p3DModel = p3DModel;
        this.pStock = pStock;
        this.pCategory = pCategory;
        this.pDescription = pDescription;
        this.pStatus = pStatus;
        this.pAddDate = pAddDate;
    }

    public Long getProductId() {
        return pId;
    }

    public void setProductId(Long pId) {
        this.pId = pId;
    }

    public String getProductName() {
        return pName;
    }

    public void setProductName(String pName) {
        this.pName = pName;
    }

    public BigDecimal getProductPrice() {
        return pPrice;
    }

    public void setProductPrice(BigDecimal pPrice) {
        this.pPrice = pPrice;
    }

    public String getProductBrand() {
        return pBrand;
    }

    public void setProductBrand(String pBrand) {
        this.pBrand = pBrand;
    }

    public String getProduct3DModel() {
        return p3DModel;
    }

    public void setProduct3DModel(String p3DModel) {
        this.p3DModel = p3DModel;
    }

    public Integer getProductStock() {
        return pStock;
    }

    public void setProductStock(Integer pStock) {
        this.pStock = pStock;
    }

    public String getProductCategory() {
        return pCategory;
    }

    public void setProductCategory(String pCategory) {
        this.pCategory = pCategory;
    }

    public String getProductDescription() {
        return pDescription;
    }

    public void setProductDescription(String pDescription) {
        this.pDescription = pDescription;
    }

    public Boolean getProductStatus() {
        return pStatus;
    }

    public void setProductStatus(Boolean pStatus) {
        this.pStatus = pStatus;
    }

    public LocalDateTime getProductAddDate() {
        return pAddDate;
    }

    public void setProductAddDate(LocalDateTime pAddDate) {
        this.pAddDate = pAddDate;
    }

    public List<PImages> getImages() {
        return images;
    }

    public void setImages(List<PImages> images) {
        this.images = images;
    }

    public List<PSizeColor> getSizesColors() {
        return sizesColors;
    }

    public void setSizesColors(List<PSizeColor> sizesColors) {
        this.sizesColors = sizesColors;
    }
}