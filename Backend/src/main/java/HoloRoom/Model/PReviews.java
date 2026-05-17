package HoloRoom.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews")
public class PReviews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("pReviewId")
    private Long pReviewId;

    @JsonProperty("pRating")
    private int pRating;

    @JsonProperty("pComment")
    private String pComment;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("Date")
    private LocalDateTime Date;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Products product;

    public PReviews() {}

    public PReviews(String userName, int pRating, String pComment) {
        this.userName = userName;
        this.pRating = pRating;
        this.pComment = pComment;
    }

    @PrePersist
    protected void onCreate() {
        this.Date = LocalDateTime.now();
    }

    @JsonProperty("userName")
    public String getuserName() { return userName; }
    public void setuserName(String userName) {this.userName = userName; }

    @JsonProperty("pReviewId")
    public Long getpReviewId() { return pReviewId; }
    public void setpReviewId(Long pReviewId) { this.pReviewId = pReviewId; }

    @JsonProperty("pRating")
    public int getpRating() { return pRating; }
    public void setpRating(int pRating) { this.pRating = pRating; }

    @JsonProperty("pComment")
    public String getpComment() { return pComment; }
    public void setpComment(String pComment) { this.pComment = pComment; }

    @JsonIgnore
    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }

    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getProductId() : null;
    }

    @JsonProperty("Date")
    public LocalDateTime getDate() { return Date; }

}
