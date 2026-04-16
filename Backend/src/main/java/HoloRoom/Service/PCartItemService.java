package HoloRoom.Service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PCartItem;
import HoloRoom.Model.PImages;
import HoloRoom.Repository.PCartItemRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorStockRepository;

@Service
public class PCartItemService {

    @Autowired
    private PCartItemRepository cartItemRepository;

    @Autowired
    private PImagesRepository pImagesRepository;

    //GETTERS FOR CART ITEM DETAILS

    public PCartItem getCartItemById(Long cartItemId) {
        return cartItemRepository.findById(cartItemId).orElse(null);
    }

    public String getSize(Long cartItemId) {
         return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getPscs().getProductSize();
    }

    public String getColor(Long cartItemId) {
         return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getPscs().getProductColor();
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

    public BigDecimal getPrice(Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"))
            .getProduct().getProductPrice().multiply(BigDecimal.valueOf(getquantityInCart(cartItemId)));
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

        item.setPrice(item.getProduct().getProductPrice().multiply(BigDecimal.valueOf(quantity)));
        item.getCart().updateTotal();

        cartItemRepository.save(item);
    }

}