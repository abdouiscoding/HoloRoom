package HoloRoom.Model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Products {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pId")
    private Long pId;

    @JsonProperty("pName")
    private String pName;

    @JsonProperty("pPrice")
    private float pPrice;

    @JsonProperty("pDiscount")
    private float pDiscount;

    @JsonProperty("pFinalPrice")
    private float pFinalPrice;

    @JsonProperty("pBrand")
    private String pBrand;

    @JsonProperty("p3DModel")
    private String p3DModel;

    @JsonProperty("pPlacement")
    private String pPlacement;

    @JsonProperty("pARSupport")
    private boolean pARSupport;

    @ManyToMany
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<PCategories> categories = new ArrayList<>();

    @JsonProperty("pStatus")
    private String pStatus;

    @JsonProperty("pDescription")
    private String pDescription;

    @JsonProperty("pRating")
    private Double pRating;

    @JsonProperty("pAddDate")
    private LocalDateTime pAddDate;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonProperty("images")
    private List<PImages> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonProperty("sizecolorstock")
    private List<PSizeColorStock> sizecolorstock = new ArrayList<>();

    @JsonProperty("pSold")
    private int pSold;

    @JsonProperty("pWishes")
    private int pWishes;

    public Products() {}

    public Products(String pName, float pPrice, String pBrand, String p3DModel, String pPlacement,
                    String pDescription, Double pRating) {
        this.pName = pName;
        this.pDiscount = 0;
        this.pPrice = pPrice;
        this.pFinalPrice = pPrice;
        this.pBrand = pBrand;
        this.p3DModel = p3DModel;
        this.pStatus = "normal";
        this.pDescription = pDescription;
        this.pRating = pRating;
        this.pARSupport = false;
    }

   @PrePersist
protected void onCreate() {
    this.pAddDate = LocalDateTime.now();
    calculatePrice();
}

@PreUpdate
protected void calculateFinalPrice() {
    calculatePrice();
}

private void calculatePrice() {

    float discountFactor = pDiscount / 100f;

    float finalPrice = pPrice * (1 - discountFactor);

    // round to integer
    this.pFinalPrice = (float) Math.round(finalPrice);
}

    // ===== Getters / Setters =====

    @JsonProperty("pId")
    public Long getProductId() { return pId; }
    public void setProductId(Long pId) { this.pId = pId; }

    @JsonProperty("pName")
    public String getProductName() { return pName; }
    public void setProductName(String pName) { this.pName = pName; }

    @JsonProperty("pPrice")
    public float getProductPrice() { return pPrice; }
    public void setProductPrice(float pPrice) { this.pPrice = pPrice; }

    @JsonProperty("pDiscount")
    public float getProductDiscount() { return pDiscount; }
    public void setProductDiscount(float pDiscount) { this.pDiscount = pDiscount; }

    @JsonProperty("pFinalPrice")
    public float getProductFinalPrice() { return pFinalPrice; }
    public void setProductFinalPrice(float price) { this.pFinalPrice = price; }

    @JsonProperty("pBrand")
    public String getProductBrand() { return pBrand; }
    public void setProductBrand(String pBrand) { this.pBrand = pBrand; }

    @JsonProperty("p3DModel")
    public String getProduct3DModel() { return p3DModel; }
    public void setProduct3DModel(String p3DModel) { this.p3DModel = p3DModel; }

    @JsonProperty("pPlacement")
    public String getProductPlacement() { return pPlacement; }
    public void setProductPlacement(String pPlacement) { this.pPlacement = pPlacement; }

    @JsonProperty("pARSupport")
    public boolean isProductARSupport() { return pARSupport; }
    public void setProductARSupport(boolean AR) { this.pARSupport=AR; }

    @JsonProperty("pStatus")
    public String getProductStatus() { return pStatus; }
    public void setProductStatus(String pStatus) { this.pStatus = pStatus; }

    @JsonProperty("pDescription")
    public String getProductDescription() { return pDescription; }
    public void setProductDescription(String pDescription) { this.pDescription = pDescription; }

    @JsonProperty("pRating")
    public Double getProductRating() { return pRating; }
    public void setProductRating(Double pRating) { this.pRating = pRating; }

    @JsonProperty("pSold")
    public int getPSold() { return pSold; }
    public void setPSold(int pSold) { this.pSold = pSold; }
    public void addtoPSold(int quantity) { this.pSold = this.pSold+ quantity; }

    @JsonProperty("pWishes")
    public int getPWishes() { return pWishes; }
    public void setPWishes(int pWishes) { this.pWishes = pWishes; }
    public void increasePWishes() { this.pWishes = this.pWishes+1; }
    public void decreasePWishes() { this.pWishes = this.pWishes-1; }

    @JsonProperty("pAddDate")
    public LocalDateTime getProductAddDate() { return pAddDate; }

    @JsonProperty("categories")
    public List<PCategories> getCategories() { return categories; }
    public void setCategories(List<PCategories> categories) { this.categories = categories; }

    @JsonProperty("images")
    public List<PImages> getImages() { return images; }
    public void setImages(List<PImages> images) { this.images = images; }

    @JsonProperty("sizecolorstock")
    public List<PSizeColorStock> getSizeColorStock() { return sizecolorstock; }
    public void setSizeColorStock(List<PSizeColorStock> sizeColorstock) { this.sizecolorstock = sizeColorstock; }

    // ===== Helpers =====

    public void addImage(PImages img) {
        if (images == null) images = new ArrayList<>();
        images.add(img);
        img.setProduct(this);
    }

    public void addSizeColorStock(PSizeColorStock scs) {
        if (sizecolorstock == null) sizecolorstock = new ArrayList<>();
        sizecolorstock.add(scs);
        scs.setProduct(this);
    }

    public void addCategory(PCategories cat) {
        if (categories == null) categories = new ArrayList<>();
        categories.add(cat);
    }

}