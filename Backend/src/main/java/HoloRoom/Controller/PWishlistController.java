package HoloRoom.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/wishlist")
public class PWishlistController {

    @Autowired
    private PWishlistService wishlistService;

    // GET wishlist by user ID or create if not exists
    @GetMapping("/get/{userId}")
    public ResponseEntity<PWishlist> getWishlistByUserId(@PathVariable Long userId) {
        PWishlist wishlistOpt = wishlistService.getOrCreateWishlist(userId);
            return new ResponseEntity<>(wishlistOpt, HttpStatus.OK);
        
    }

    // 2. MODIFIED: POST add item to wishlist (with duplicate check)
    @PostMapping("/add/{userId}/{pId}")
    public ResponseEntity<String> addItemToWishlist(@PathVariable Long userId,
                                                    @PathVariable Long pId) {
        try { 
            // Check if it already exists before adding
            if (wishlistService.isItemInWishlist(userId, pId)) {
                return new ResponseEntity<>("exists", HttpStatus.CONFLICT);
            }

            wishlistService.addItemToWishlist(userId, pId);
            return new ResponseEntity<>("Item added successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace(); 
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }


    // DELETE remove item from wishlist
    @DeleteMapping("/remove/{userId}/{wItemId}")
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
    @DeleteMapping("/clear/{userId}")
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
    
}


class WishlistRequest {
    private Long pId;

    // Getters and Setters are required for Jackson to work
    public Long getpId() { return pId; }
    public void setpId(Long pId) { this.pId = pId; }
}
