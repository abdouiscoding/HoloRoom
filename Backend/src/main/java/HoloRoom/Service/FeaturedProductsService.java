package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.FeaturedItem;
import HoloRoom.Model.FeaturedList;
import HoloRoom.Model.Products;
import HoloRoom.Repository.FeaturedItemRepository;
import HoloRoom.Repository.FeaturedListRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class FeaturedProductsService {

    @Autowired
    private FeaturedListRepository listRepo;

    @Autowired
    private FeaturedItemRepository itemRepo;

    @Autowired
    private ProductsService productService;

    // ---------------- GET OR CREATE LIST ----------------
    public FeaturedList CreateList(String name) {
            FeaturedList list = new FeaturedList(name);
            return listRepo.save(list);
    }

    // ---------------- GET LIST ----------------
    public FeaturedList getListById(Long id) {
        return listRepo.findById(id).orElse(null);
    }

    public List<FeaturedList> getAllLists() {
        return listRepo.findAll();
    }

    // ---------------- DELETE ITEM --------------
    public void delete(Long productId) {
        // First, remove items from all featured lists (cascade doesn't handle join tables well)
        List<FeaturedList> allLists = listRepo.findAll();
        for (FeaturedList list : allLists) {
            list.getItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
            listRepo.save(list);
        }
        
        // Then delete the items themselves
        List<FeaturedItem> items = itemRepo.findAll().stream()
            .filter(item -> item.getProduct().getProductId().equals(productId))
            .toList();
        itemRepo.deleteAll(items);
    }

    // ---------------- ADD PRODUCT TO LIST ----------------
    public FeaturedItem addProductToList(Long listId, Long productId, int order) {

        FeaturedList list = listRepo.findById(listId).orElse(null);
        if (list == null) return null;

        Products product = productService.getProductById(productId);
        if (product == null) return null;

        // shift items if same order exists
        list.getItems().forEach(item -> {
            if (item.getDisplayOrder() >= order) {
                item.setDisplayOrder(item.getDisplayOrder() + 1);
            }
        });

        FeaturedItem item = new FeaturedItem();
        item.setProduct(product);
        item.setDisplayOrder(order);

        list.getItems().add(item);

        listRepo.save(list); // cascades save

        return item;
    }

    // ---------------- REMOVE ITEM (DELETE FROM DB) ----------------
    public boolean removeItem(Long id, Long itemId) {

        FeaturedItem item = itemRepo.findById(itemId).orElse(null);
        if (item == null) return false;

        FeaturedList list = listRepo.findById(id).orElse(null);

        list.getItems().remove(item);

        itemRepo.delete(item);

        return true;
    }

    // ---------------- CLEAR LIST (DELETE ALL ITEMS) ----------------
    public boolean clearList(Long listId) {

        FeaturedList list = listRepo.findById(listId).orElse(null);
        if (list == null) return false;

        itemRepo.deleteAll(list.getItems());

        list.getItems().clear();

        return true;
    }

    // ---------------- REORDER ITEM ----------------
    public boolean updateOrder(Long id, Long itemId, int newOrder) {

        FeaturedItem item = itemRepo.findById(itemId).orElse(null);
        if (item == null) return false;

        FeaturedList list = listRepo.findById(id).orElse(null);

        int oldOrder = item.getDisplayOrder();

        for (FeaturedItem i : list.getItems()) {
            if (newOrder > oldOrder) {
                // moving down
                if (i.getDisplayOrder() > oldOrder && i.getDisplayOrder() <= newOrder) {
                    i.setDisplayOrder(i.getDisplayOrder() - 1);
                }
            } else {
                // moving up
                if (i.getDisplayOrder() < oldOrder && i.getDisplayOrder() >= newOrder) {
                    i.setDisplayOrder(i.getDisplayOrder() + 1);
                }
            }
        }

        item.setDisplayOrder(newOrder);

        listRepo.save(list);

        return true;
    }
}