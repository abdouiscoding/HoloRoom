package HoloRoom.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import HoloRoom.Model.FeaturedItem;
import HoloRoom.Model.FeaturedList;
import HoloRoom.Repository.FeaturedListRepository;
import HoloRoom.Service.FeaturedProductsService;

@RestController
@RequestMapping("/api/featured")
public class FeaturedProductsController {

    @Autowired
    private FeaturedProductsService service;

    @Autowired
    private FeaturedListRepository repo;

    // ---------------- GET ALL LISTS ----------------
    @GetMapping("/lists")
    public ResponseEntity<List<FeaturedList>> getAllLists() {
        List<FeaturedList> lists = service.getAllLists();
        if (lists.size() == 0) {  
            service.CreateList("Featured");
            lists = service.getAllLists();
            return ResponseEntity.ok(lists);
        }
        return ResponseEntity.ok(lists);
    }

    // ---------------- GET LIST BY ID ----------------
    @GetMapping("/list/{id}")
    public ResponseEntity<?> getListById(@PathVariable Long id) {
        FeaturedList list = service.getListById(id);

        if (list == null) {
            return ResponseEntity.status(404).body("Featured list not found");
        }

        return ResponseEntity.ok(list);
    }

    // ---------------- CREATE / GET LIST ----------------
    @PostMapping("/list/create")
    public ResponseEntity<FeaturedList> createList(
            @RequestParam String name
    ) {
        FeaturedList list = service.CreateList(name);
        return ResponseEntity.ok(list);
    }

    // ---------------- ADD PRODUCT TO LIST ----------------
    @PostMapping("/list/{listId}/add")
    public ResponseEntity<?> addProductToList(
            @PathVariable Long listId,
            @RequestParam Long productId,
            @RequestParam int order
    ) {
        FeaturedItem item = service.addProductToList(listId, productId, order);

        if (item == null) {
            return ResponseEntity.status(404)
                    .body("List or Product not found");
        }

        return ResponseEntity.ok(item);
    }

    // ---------------- REMOVE ITEM (DELETE FROM DB) ----------------
    @DeleteMapping("/list/{listId}/item/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long itemId,
        @PathVariable Long listId
    ) {

        boolean deleted = service.removeItem(listId,itemId);

        if (!deleted) {
            return ResponseEntity.status(404)
                    .body("Featured item not found");
        }

        return ResponseEntity.ok("Item deleted successfully");
    }

    // ---------------- CLEAR LIST ----------------
    @DeleteMapping("/list/{listId}/clear")
    public ResponseEntity<?> clearList(@PathVariable Long listId) {

        boolean cleared = service.clearList(listId);

        if (!cleared) {
            return ResponseEntity.status(404)
                    .body("Featured list not found");
        }

        return ResponseEntity.ok("List cleared successfully");
    }

    // ---------------- REORDER ITEM ----------------
    @PutMapping("/list/{listId}/item/{itemId}/order")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long itemId,
            @PathVariable Long listId,
            @RequestParam int newOrder
    ) {

        boolean updated = service.updateOrder(listId, itemId, newOrder);

        if (!updated) {
            return ResponseEntity.status(404)
                    .body("Featured item not found");
        }

        return ResponseEntity.ok("Order updated successfully");
    }
}