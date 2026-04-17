package HoloRoom.Controller;

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

import HoloRoom.Model.PCart;
import HoloRoom.Service.PCartService;

@RestController
@RequestMapping("/api/cart")
public class PCartController {

    @Autowired
    private PCartService cartService;

    @GetMapping("/getbyid/{cartId}")
    public ResponseEntity<PCart> getCartById(@PathVariable Long cartId) {
        return cartService.getCartById(cartId)
                .map(cart -> new ResponseEntity<>(cart, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/getbyuser/{userId}")
    public ResponseEntity<PCart> getCartByuserId(@PathVariable long userId) {
        try{
        PCart cart = cartService.getOrCreateCart(userId);
        return new ResponseEntity<>(cart, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/additem/{cartId}")
    public ResponseEntity<PCart> addItemToCart(@PathVariable Long cartId,
                                               @RequestBody AddItemRequest request) {
        try {
            cartService.addItemToCart(cartId, request.pId, request.pscsId, request.pImageId , request.quantity);
            return cartService.getCartById(cartId)
                    .map(cart -> new ResponseEntity<>(cart, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("removeitem/{cartId}/{cartItemId}")
    public ResponseEntity<PCart> removeItemFromCart(@PathVariable Long cartId,
                                                   @PathVariable Long cartItemId) {
        try {
            cartService.removeItemFromCart(cartId, cartItemId);
            return cartService.getCartById(cartId)
                    .map(cart -> new ResponseEntity<>(cart, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("delete/{cartId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long cartId) {
        cartService.clearCartById(cartId);
        return ResponseEntity.noContent().build();
    }

    public static class AddItemRequest {
        public Long pscsId;
        public Long pId;
        public Long pImageId;
        public int quantity;
    }
}
