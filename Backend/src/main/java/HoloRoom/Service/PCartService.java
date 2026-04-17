package HoloRoom.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import HoloRoom.Model.PCart;
import HoloRoom.Model.PCartItem;
import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCartRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorStockRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class PCartService {

    @Autowired
    private PCartRepository pCartRepository;

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private PSizeColorStockRepository pSizeColorStockRepository;

    @Autowired
    private PImagesRepository pImagesRepository;

    /**
     * Find cart for a specific user.
     */
    public Optional<PCart> getCartByUserId(Long userId) {
        return pCartRepository.findByUserId(userId);
    }

    /**
     * Find cart by its database id.
     */
    public Optional<PCart> getCartById(Long cartId) {
        return pCartRepository.findById(cartId);
    }

    /**
     * Return existing cart for the user or create an empty cart.
     */
    public PCart getOrCreateCart(Long userId) {
        return pCartRepository.findByUserId(userId).orElseGet(() -> {
            PCart cart = new PCart();
            cart.setUserId(userId);
            cart.setTotal(BigDecimal.ZERO);
            cart.setItems(new ArrayList<>());
            return pCartRepository.save(cart);
        });
    }

    /**
     * Helper to load a product and throw a clear exception if it does not exist.
     */
    private Products getProductOrThrow(Long productId) {
        return productsRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    /**
     * Add items to an existing cart by cart id.
     */
    @Transactional
    public void addItemToCart(Long cartId, Long productId, Long pscsId, Long pImageId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Products product = getProductOrThrow(productId);
        PSizeColorStock pscs = getProductSizeColorStockOrThrow(pscsId);
        String image = getPImageOrThrow(pImageId).getProductImage();
        String size = pscs.getProductSize();
        String color = pscs.getProductColor();
        BigDecimal price = product.getProductPrice().multiply(BigDecimal.valueOf(quantity));

        PCart cart = pCartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        PCartItem existingItem = cart.getItems().stream()
            .filter(item -> productId.equals(item.getProduct().getProductId()) && pscsId.equals(item.getPscs().getPscsId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            PCartItem newItem = new PCartItem(product, pscs, image, size, color, price, quantity);
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        updateCartTotal(cart);
    }

    private PSizeColorStock getProductSizeColorStockOrThrow(Long pscsId) {
        return pSizeColorStockRepository.findById(pscsId)
            .orElseThrow(() -> new IllegalArgumentException("Product size/color stock not found"));
    }

    private PImages getPImageOrThrow(Long pImageId) {
        return pImagesRepository.findById(pImageId)
            .orElseThrow(() -> new IllegalArgumentException("Product image not found"));
    }

    /**
     * Save the current cart state.
     */
    public void saveCart(PCart cart) {
        pCartRepository.save(cart);
    }

    /**
     * Remove a cart item from the cart by cart item id.
     */
    @Transactional
    public void removeItemFromCart(Long cartId, Long cartItemId) {
        PCart cart = pCartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        if (cart.getItems() == null) {
            return;
        }

        boolean removed = cart.getItems().removeIf(item -> cartItemId.equals(item.getCartItemId()));
        if (removed) {
            updateCartTotal(cart);
        }
    }

    /**
     * Update the quantity of a specific cart item.
     */
    @Transactional
    public void updateItemQuantity(Long cartId, Long cartItemId, int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        PCart cart = pCartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        if (cart.getItems() == null) {
            return;
        }

        cart.getItems().stream()
            .filter(item -> cartItemId.equals(item.getCartItemId()))
            .findFirst()
            .ifPresent(item -> {
                if (quantity == 0) {
                    cart.getItems().remove(item);
                } else {
                    item.setQuantity(quantity);
                }
                updateCartTotal(cart);
            });
    }

    /**
     * Delete a cart by user id.
     */
    public void deleteCartByUserId(Long userId) {
        Optional<PCart> cartOpt = pCartRepository.findByUserId(userId);
        cartOpt.ifPresent(cart -> pCartRepository.delete(cart));
    }

    /**
     * Empty the cart contents and reset the total.
     */
    public void clearCartById(Long cartId) {
        pCartRepository.findById(cartId).ifPresent(cart -> {
            cart.setItems(new ArrayList<>());
            cart.setTotal(BigDecimal.ZERO);
            pCartRepository.save(cart);
        });
    }

    /**
     * Recalculate the cart total from item prices and quantities, then persist.
     */
    public void updateCartTotal(PCart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            cart.setTotal(BigDecimal.ZERO);
            pCartRepository.save(cart);
            return;
        }

        BigDecimal total = cart.getItems().stream()
            .map(item -> item.getProduct().getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotal(total);
        pCartRepository.save(cart);
    }

}