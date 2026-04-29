package HoloRoom.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import HoloRoom.Model.PWishlist;
import HoloRoom.Model.PWishlistItem;
import HoloRoom.Repository.PWishlistItemRepository;
import HoloRoom.Repository.PWishlistRepository;

@Service
@Transactional
public class PWishlistService {

    @Autowired
    private PWishlistRepository wishlistRepository;

    @Autowired
    private PWishlistItemRepository wishlistItemRepository;

    // -------------------------------------------------
    // GET WISHLIST
    // -------------------------------------------------
    public Optional<PWishlist> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    // -------------------------------------------------
    // CREATE IF NOT EXISTS
    // -------------------------------------------------
    public PWishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            PWishlist wishlist = new PWishlist();
            wishlist.setUserId(userId);
            wishlist.setwName("Wishlist");
            wishlist.setWishlistItems(new ArrayList<>());
            return wishlistRepository.save(wishlist);
        });
    }

    // -------------------------------------------------
    // CHECK EXISTS
    // -------------------------------------------------
    public boolean isItemInWishlist(Long userId, Long pId) {
        PWishlist wishlist = getOrCreateWishlist(userId);

        if (wishlist.getWishlistItems() == null) {
            return false;
        }

        return wishlist.getWishlistItems()
                .stream()
                .anyMatch(item -> pId.equals(item.getpId()));
    }

    // -------------------------------------------------
    // ADD ITEM
    // -------------------------------------------------
    public void addItemToWishlist(Long userId, Long productId) {
        PWishlist wishlist = getOrCreateWishlist(userId);

        if (wishlist.getWishlistItems() == null) {
            wishlist.setWishlistItems(new ArrayList<>());
        }

        // avoid duplicate
        boolean exists = wishlist.getWishlistItems()
                .stream()
                .anyMatch(item -> productId.equals(item.getpId()));

        if (exists) {
            return;
        }

        PWishlistItem newItem = new PWishlistItem();
        newItem.setpId(productId);
        newItem.setWishlist(wishlist);

        wishlist.getWishlistItems().add(newItem);

        wishlistRepository.save(wishlist);
    }

    // -------------------------------------------------
    // REMOVE ITEM (FIXED)
    // -------------------------------------------------
    public void removeItemFromWishlist(Long userId, Long wItemId) {

        PWishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        if (wishlist.getWishlistItems() == null ||
            wishlist.getWishlistItems().isEmpty()) {
            throw new RuntimeException("Wishlist is empty");
        }

        PWishlistItem itemToDelete = wishlist.getWishlistItems()
                .stream()
                .filter(item -> wItemId.equals(item.getwItemId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // remove from list
        wishlist.getWishlistItems().remove(itemToDelete);

        // IMPORTANT: break relation
        itemToDelete.setWishlist(null);

        // delete row directly
        wishlistItemRepository.delete(itemToDelete);

        wishlistRepository.save(wishlist);
    }

    // -------------------------------------------------
    // CLEAR ALL ITEMS
    // -------------------------------------------------
    public void clearWishlist(Long userId) {

        PWishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        if (wishlist.getWishlistItems() != null) {
            for (PWishlistItem item : wishlist.getWishlistItems()) {
                item.setWishlist(null);
            }

            wishlistItemRepository.deleteAll(wishlist.getWishlistItems());
            wishlist.getWishlistItems().clear();
        }

        wishlistRepository.save(wishlist);
    }

    // -------------------------------------------------
    // DELETE ENTIRE WISHLIST
    // -------------------------------------------------
    public void deleteWishlist(Long userId) {
        Optional<PWishlist> wishlistOpt =
                wishlistRepository.findByUserId(userId);

        wishlistOpt.ifPresent(wishlistRepository::delete);
    }

    // -------------------------------------------------
    // ANALYTICS
    // -------------------------------------------------
    public List<PWishlistItem> getWishlistItemsByProductId(Long productId) {
        return wishlistItemRepository.findByPId(productId);
    }
}