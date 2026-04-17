package HoloRoom.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.PWishlist;
import HoloRoom.Model.PWishlistItem;
import HoloRoom.Service.PWishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class PWishlistController {

    @Autowired
    private PWishlistService wishlistService;

    // GET wishlist by user ID
    @GetMapping("/{userId}")
    public ResponseEntity<PWishlist> getWishlistByUserId(@PathVariable Long userId) {
        Optional<PWishlist> wishlist = wishlistService.getWishlistByUserId(userId);
        return wishlist.map(w -> new ResponseEntity<>(w, HttpStatus.OK))
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // POST add item to wishlist
    @PostMapping("/{userId}/add")
    public ResponseEntity<Void> addItemToWishlist(@PathVariable Long userId,
                                                  @RequestBody AddWishlistItemRequest request) {
        try {
            wishlistService.addItemToWishlist(userId, request.getProductId(), request.getQuantity());
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // PUT update item quantity
    @PutMapping("/{userId}/update/{wItemId}")
    public ResponseEntity<Void> updateItemQuantity(@PathVariable Long userId,
                                                   @PathVariable Long wItemId,
                                                   @RequestBody UpdateQuantityRequest request) {
        try {
            wishlistService.updateItemQuantity(userId, wItemId, request.getQuantity());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE remove item from wishlist
    @DeleteMapping("/{userId}/remove/{wItemId}")
    public ResponseEntity<Void> removeItemFromWishlist(@PathVariable Long userId,
                                                       @PathVariable Long wItemId) {
        try {
            wishlistService.removeItemFromWishlist(userId, wItemId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE clear wishlist
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearWishlist(@PathVariable Long userId) {
        try {
            wishlistService.clearWishlist(userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // GET wishlist items by product ID (for analytics)
    @GetMapping("/items/product/{productId}")
    public ResponseEntity<List<PWishlistItem>> getWishlistItemsByProductId(@PathVariable Long productId) {
        List<PWishlistItem> items = wishlistService.getWishlistItemsByProductId(productId);
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    // Request DTOs
    public static class AddWishlistItemRequest {
        private Long productId;
        private int quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class UpdateQuantityRequest {
        private int quantity;

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
