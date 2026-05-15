package HoloRoom.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import HoloRoom.Model.FeaturedItem;
import HoloRoom.Model.FeaturedList;
import HoloRoom.Model.Products;
import HoloRoom.Repository.FeaturedItemRepository;
import HoloRoom.Repository.FeaturedListRepository;

@Service
public class FeaturedProductsService {

    @Autowired private FeaturedListRepository listRepo;
    @Autowired private FeaturedItemRepository itemRepo;
    @Autowired private ProductsService productService;

    public FeaturedList createList(String name) {
        return listRepo.save(new FeaturedList(name));
    }

    public FeaturedList getListById(Long id) {
        return listRepo.findById(id).orElse(null);
    }

    public FeaturedList getListByName(String name) {
        return listRepo.findByName(name);
    }

    public List<FeaturedList> getAllLists() {
        return listRepo.findAll();
    }
    
    /** Called when a product is deleted from the catalog. */
    @Transactional
    public void deleteByProduct(Long productId) {
        for (FeaturedList list : listRepo.findAll()) {
            list.getItems().removeIf(item ->
                item.getProduct() != null
                && item.getProduct().getProductId().equals(productId));
            listRepo.save(list);
        }
    }

    /**
     * Add/replace product at a spot in a list. One product per spot — if the spot
     * already has a product, it's swapped out.
     */
    @Transactional
    public FeaturedItem setProductAtSpot(String listName, Long productId, String spot) {
        FeaturedList list = listRepo.findByName(listName);
        if (list == null) return null;

        Products product = productService.getProductById(productId);
        if (product == null) return null;

        if(list.getItems().stream().anyMatch(it -> spot.equalsIgnoreCase(it.getSpot()))) {
            list.getItems().removeIf(it -> spot.equalsIgnoreCase(it.getSpot()));
            itemRepo.deleteById(
                list.getItems().stream()
                    .filter(it -> spot.equalsIgnoreCase(it.getSpot()))
                    .findFirst().get().getId());
        }
        // remove any existing item at the same spot
        list.getItems().removeIf(it -> spot.equalsIgnoreCase(it.getSpot()));

        FeaturedItem item = new FeaturedItem();
        item.setProduct(product);
        item.setSpot(spot);
        itemRepo.save(item);
        list.getItems().add(item);

        listRepo.save(list);
        return item;
    }

    @Transactional
    public boolean removeItem(String listName, Long itemId) {
        FeaturedList list = listRepo.findByName(listName);
        if (list == null) return false;
        boolean removed = list.getItems().removeIf(it -> it.getId().equals(itemId));
        if (removed) listRepo.save(list);
        return removed;
    }

    @Transactional
    public boolean clearList(Long listId) {
        FeaturedList list = listRepo.findById(listId).orElse(null);
        if (list == null) return false;
        list.getItems().clear();
        listRepo.save(list);
        return true;
    }

    @Transactional
    public boolean updateSpot(String listName, Long itemId, String newSpot) {
        FeaturedList list = listRepo.findByName(listName);
        if (list == null) return false;

        FeaturedItem target = list.getItems().stream()
                .filter(it -> it.getId().equals(itemId))
                .findFirst().orElse(null);
        if (target == null) return false;

        // bump out anyone already in newSpot
        list.getItems().removeIf(it ->
            !it.getId().equals(itemId) && newSpot.equalsIgnoreCase(it.getSpot()));

        target.setSpot(newSpot);
        listRepo.save(list);
        return true;
    }
}