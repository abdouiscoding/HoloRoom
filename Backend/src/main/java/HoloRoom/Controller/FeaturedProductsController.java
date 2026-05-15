package HoloRoom.Controller;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import HoloRoom.Model.FeaturedItem;
import HoloRoom.Model.FeaturedList;
import HoloRoom.Service.FeaturedProductsService;

@RestController
@RequestMapping("/api/featured")
public class FeaturedProductsController {

    private static final List<String> DEFAULT_ROOMS =
        Arrays.asList("living_room", "bedroom", "kitchen", "office");

    @Autowired
    private FeaturedProductsService service;

    /** Returns all 4 rooms with their items. Auto-seeds on first call. */
    @GetMapping("/lists")
    public ResponseEntity<List<FeaturedList>> getAllLists() {
        List<FeaturedList> lists = service.getAllLists();
        if (lists.isEmpty()) {
            for (String room : DEFAULT_ROOMS) service.createList(room);
            lists = service.getAllLists();
        }
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/list/{id}")
    public ResponseEntity<?> getListById(@PathVariable Long id) {
        FeaturedList list = service.getListById(id);
        if (list == null) return ResponseEntity.status(404).body("Room not found");
        return ResponseEntity.ok(list);
    }

    @GetMapping("/room/{name}")
    public ResponseEntity<?> getListByName(@PathVariable String name) {
        FeaturedList list = service.getListByName(name);
        if (list == null) return ResponseEntity.status(404).body("Room not found");
        return ResponseEntity.ok(list);
    }

    @PostMapping("/list/create")
    public ResponseEntity<FeaturedList> createList(@RequestParam String name) {
        return ResponseEntity.ok(service.createList(name));
    }

    /** Place / replace product at a spot in a room. */
    @PostMapping("/list/{listName}/spot")
    public ResponseEntity<?> setProductAtSpot(
            @PathVariable String listName,
            @RequestParam Long productId,
            @RequestParam String spot) {
        FeaturedItem item = service.setProductAtSpot(listName, productId, spot);
        if (item == null) return ResponseEntity.status(404).body("List or product not found");
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/list/{listName}/item/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable String listName, @PathVariable Long itemId) {
        return service.removeItem(listName, itemId)
                ? ResponseEntity.ok("Item removed")
                : ResponseEntity.status(404).body("Item not found");
    }

    @DeleteMapping("/list/{listId}/clear")
    public ResponseEntity<?> clearList(@PathVariable Long listId) {
        return service.clearList(listId)
                ? ResponseEntity.ok("Room cleared")
                : ResponseEntity.status(404).body("Room not found");
    }
}