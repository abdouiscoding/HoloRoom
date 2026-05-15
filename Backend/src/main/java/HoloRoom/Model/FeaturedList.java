package HoloRoom.Model;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "featured_lists")
public class FeaturedList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Room key: living_room | bedroom | kitchen | office */
    private String name;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "list_id")
    private List<FeaturedItem> items = new ArrayList<>();

    public FeaturedList() {}
    public FeaturedList(String name) { this.name = name; }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<FeaturedItem> getItems() { return items; }
    public void setItems(List<FeaturedItem> items) { this.items = items; }
}