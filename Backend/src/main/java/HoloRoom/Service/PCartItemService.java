package HoloRoom.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PCartItem;
import HoloRoom.Repository.PCartItemRepository;
import HoloRoom.Repository.PImagesRepository;

@Service
public class PCartItemService {

    @Autowired
    private PCartItemRepository cartItemRepository;

    //GETTERS FOR CART ITEM DETAILS
    public void delete(Long pId) {
    List<PCartItem> items = cartItemRepository.findAll();

        items.stream()
            .filter(item -> item.getProduct().getProductId().equals(pId))
            .forEach(cartItemRepository::delete);
    }
    

    public PCartItem getCartItemById(Long cartItemId) {
        return cartItemRepository.findById(cartItemId).orElse(null);
    }

    public String getSize(Long cartItemId) {
         return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getPscs().getProductSize();
    }

    public List<String> getColors(Long cartItemId) {
    return cartItemRepository.findById(cartItemId)
        .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
        .getProduct()
        .getSizeColorStock()
        .stream()
        .map(pscs -> pscs.getProductColor())
        .distinct()
        .toList();
}

    public int getStock(Long cartItemId) {
         return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getPscs().getProductStock();
    }

    public String getImage(Long cartItemId){
        return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getImage();
    }

    public float getPrice(Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getProduct().getProductFinalPrice()*getquantityInCart(cartItemId);
    }

    public String getProductName(Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getProduct().getProductName();
    }

    public int getquantityInCart(Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getQuantity();
    }


    //SETTERS FOR CART ITEM DETAILS

    public void updateCartItem(Long id, String image, int quantity, String size, String color) {
        PCartItem item = cartItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Not found"));

        item.setImage(image);
        item.setQuantity(quantity);
        item.setSize(size);
        item.setColor(color);

        item.setSubtotal((item.getProduct().getProductFinalPrice() * quantity));
        item.getCart().updateTotal();

        cartItemRepository.save(item);
    }

}