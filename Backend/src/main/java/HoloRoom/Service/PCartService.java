package HoloRoom.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import HoloRoom.Model.PCart;
import HoloRoom.Model.PCartItem;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCartRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class PCartService {
    @Autowired
    private PCartRepository pCartRepository;

    @Autowired
    private ProductsRepository productsRepository;

    public Optional<PCart> getCartByUserId(String userId) {
        return pCartRepository.findByuserId(userId);
    }

    public Optional<PCart> getCartById(Long cartId) {
        return pCartRepository.findById(cartId);
    }

    public PCart getOrCreateCart(String userId) {
        return pCartRepository.findByuserId(userId).orElseGet(() -> {
            PCart cart = new PCart();
            cart.setUserId(userId);
            cart.setTotal(BigDecimal.ZERO);
            cart.setItems(new ArrayList<>());
            return pCartRepository.save(cart);
        });
    }

    @Transactional
    public void addItemToCart(Long cartId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Products product = productsRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        PCart cart = pCartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        PCartItem existingItem = cart.getItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            PCartItem newItem = new PCartItem(product, quantity);
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        updateCartTotal(cart);
    }

    public void saveCart(PCart cart) {
        pCartRepository.save(cart);
    }

    @Transactional
    public void addItemToCart(String userId, Long productId, int quantity) {

        PCart cart = getOrCreateCart(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        PCartItem existingItem = cart.getItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            PCartItem newItem = new PCartItem(productsRepository.findById(productId).orElse(null), quantity);
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        updateCartTotal(cart);
    }

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

    public void deleteCartByUserId(String userId) {
        Optional<PCart> cartOpt = pCartRepository.findByuserId(userId);
        cartOpt.ifPresent(cart -> pCartRepository.delete(cart));
    }

    public void clearCartById(Long cartId) {
        pCartRepository.findById(cartId).ifPresent(cart -> {
            cart.setItems(new ArrayList<>());
            cart.setTotal(BigDecimal.ZERO);
            pCartRepository.save(cart);
        });
    }

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
