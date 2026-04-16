package HoloRoom.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PWishlist;
import HoloRoom.Model.PWishlistItem;
import HoloRoom.Repository.PWishlistRepository;
import HoloRoom.Repository.PWishlistItemRepository;

@Service
public class PWishlistService {

    @Autowired
    private PWishlistRepository wishlistRepository;

    @Autowired
    private PWishlistItemRepository wishlistItemRepository;

    public Optional<PWishlist> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    public PWishlist getOrCreateWishlist(Long userId, String wName) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            PWishlist wishlist = new PWishlist();
            wishlist.setwName(wName != null ? wName : "Default Wishlist");
            wishlist.setUserId(userId);
            wishlist.setWishlistItems(new ArrayList<>());
            return wishlistRepository.save(wishlist);
        });
    }

    public void addItemToWishlist(Long userId, Long productId, int quantity) {
        PWishlist wishlist = getOrCreateWishlist(userId, null);
        if (wishlist.getWishlistItems() == null) {
            wishlist.setWishlistItems(new ArrayList<>());
        }

        PWishlistItem existingItem = wishlist.getWishlistItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            PWishlistItem newItem = new PWishlistItem(productId, quantity);
            newItem.setWishlist(wishlist);
            wishlist.getWishlistItems().add(newItem);
        }

        wishlistRepository.save(wishlist);
    }

    public void removeItemFromWishlist(Long userId, Long wItemId) {
        Optional<PWishlist> wishlistOpt = wishlistRepository.findByUserId(userId);
        wishlistOpt.ifPresent(wishlist -> {
            if (wishlist.getWishlistItems() == null) {
                return;
            }
            wishlist.getWishlistItems().removeIf(item -> wItemId.equals(item.getwItemId()));
            wishlistRepository.save(wishlist);
        });
    }

    public void updateItemQuantity(Long userId, Long wItemId, int quantity) {
        Optional<PWishlist> wishlistOpt = wishlistRepository.findByUserId(userId);
        wishlistOpt.ifPresent(wishlist -> {
            if (wishlist.getWishlistItems() == null) {
                return;
            }
            wishlist.getWishlistItems().stream()
                .filter(item -> wItemId.equals(item.getwItemId()))
                .findFirst()
                .ifPresent(item -> {
                    if (quantity == 0) {
                        wishlist.getWishlistItems().remove(item);
                    } else {
                        item.setQuantity(quantity);
                    }
                    wishlistRepository.save(wishlist);
                });
        });
    }

    public void clearWishlist(Long userId) {
        Optional<PWishlist> wishlistOpt = wishlistRepository.findByUserId(userId);
        wishlistOpt.ifPresent(wishlist -> {
            wishlist.setWishlistItems(new ArrayList<>());
            wishlistRepository.save(wishlist);
        });
    }

    public void deleteWishlist(Long userId) {
        Optional<PWishlist> wishlistOpt = wishlistRepository.findByUserId(userId);
        wishlistOpt.ifPresent(wishlist -> wishlistRepository.delete(wishlist));
    }

    public List<PWishlistItem> getWishlistItemsByProductId(Long productId) {
        return wishlistItemRepository.findByProductId(productId);
    }
}
