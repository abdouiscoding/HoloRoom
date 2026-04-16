package HoloRoom.Controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.PCartItem;
import HoloRoom.Service.PCartItemService;

@RestController
@RequestMapping("/api/cartitem")
public class PCartItemController {
    @Autowired
    private PCartItemService cartItemService;

    @GetMapping("/get/{cartItemId}")
    public ResponseEntity<PCartItem> getCartItem(@PathVariable Long cartItemId) {
        try {
            PCartItem cartItem = cartItemService.getCartItemById(cartItemId);
            return new ResponseEntity<>(cartItem, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/image/{cartItemId}")
    public ResponseEntity<String> getImage(@PathVariable Long cartItemId) {
        try {
            String image = cartItemService.getImage(cartItemId);
            return new ResponseEntity<>(image, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
            
    }

    @GetMapping("/get/price/{cartItemId}")
    public ResponseEntity<BigDecimal> getPrice(@PathVariable Long cartItemId) {
        try {
            BigDecimal price = cartItemService.getPrice(cartItemId);
            return new ResponseEntity<>(price, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/productname/{cartItemId}")
    public ResponseEntity<String> getProductName(@PathVariable Long cartItemId) {
        try {
            String productName = cartItemService.getProductName(cartItemId);
            return new ResponseEntity<>(productName, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/quantity/{cartItemId}")
    public ResponseEntity<Integer> getQuantityInCart(@PathVariable Long cartItemId) {
        try {
            int quantity = cartItemService.getquantityInCart(cartItemId);
            return new ResponseEntity<>(quantity, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/size/{pscsId}")
    public ResponseEntity<String> getSize(@PathVariable Long cartItemId) {
        try {
            String size = cartItemService.getSize(cartItemId);
            return new ResponseEntity<>(size, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/color/{cartItemId}")
    public ResponseEntity<String> getColor(@PathVariable Long cartItemId) {
        try {
            String color = cartItemService.getColor(cartItemId);
            return new ResponseEntity<>(color, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/stock/{cartItemId}")
    public ResponseEntity<Integer> getStock(@PathVariable Long cartItemId) {
        try {
            int stock = cartItemService.getStock(cartItemId);
            return new ResponseEntity<>(stock, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Void> updateCartItem(
        @PathVariable Long cartItemId,
        @RequestBody UpdateCartItemRequest request) {

    try {
        cartItemService.updateCartItem(
            cartItemId,
            request.image,
            request.quantity,
            request.size,
            request.color
        );

        return ResponseEntity.ok().build();

    } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest().build();
    }
    }


    public static class UpdateCartItemRequest {
        public String size;
        public String color;
        public Long pId;
        public String image;
        public int quantity;
    }
}