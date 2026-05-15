package HoloRoom.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "featured_items")
public class FeaturedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "spot")
    private String spot;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;

    public FeaturedItem() {}

    public Long getId() { return id; }

    @JsonProperty("spot")
    public String getSpot() { return spot; }
    public void setSpot(String spot) { this.spot = spot; }

    public Products getProduct() { return product; }
    public void setProduct(Products product) { this.product = product; }
}