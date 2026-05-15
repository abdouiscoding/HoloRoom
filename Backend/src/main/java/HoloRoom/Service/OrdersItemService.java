package HoloRoom.Service;

import HoloRoom.Model.Item;
import HoloRoom.Model.OrdersItem;
import HoloRoom.Model.PCart;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.OrdersItemRepository;
import HoloRoom.Repository.ProductsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrdersItemService {

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private OrdersItemRepository orderItemRepository;

    public List<OrdersItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public OrdersItem getOrderItemById(Long id) {
        return orderItemRepository.findById(id).orElse(null);
    }

    public OrdersItem saveOrderItem(OrdersItem orderItem) {

    orderItem.getItems()
        .forEach(item -> {
            Products product = item.getPId() != null ? productsRepository.findById(item.getPId()).orElse(null) : null;
            if (product != null) {
                product.addtoPSold(item.getQuantity());
                productsRepository.save(product); // persist change
            }
        });

    return orderItemRepository.save(orderItem);
    }

    public void deleteOrderItem(Long id) {
        orderItemRepository.deleteById(id);
    }

    public OrdersItem updateOrderItemStatus(Long id, String status) {
        Optional<OrdersItem> optionalOrderItem = orderItemRepository.findById(id);
        if (optionalOrderItem.isPresent()) {
            OrdersItem orderItem = optionalOrderItem.get();
            orderItem.setStatus(status);
            return orderItemRepository.save(orderItem);
        }
        return null;
    }

    // get cart items by order id
    public List<Item> getItemsByOrderId(Long orderId) {
        OrdersItem orderItem = getOrderItemById(orderId);
        if (orderItem != null) {
            return orderItem.getItems();
        }
        return null;
    }

    public OrdersItem cancelOrderItem(Long id) {
        OrdersItem orderItem = orderItemRepository.findById(id).orElse(null);
        if (orderItem == null) return null;

        String current = orderItem.getStatus() == null ? "" : orderItem.getStatus();
        if (!"Pending".equalsIgnoreCase(current)) {
            throw new IllegalStateException("Only pending orders can be canceled");
        }

        // For each item: decrement pSold (and stock if you have size/color resolution)
        orderItem.getItems().forEach(item -> {
            if (item.getPId() == null) return;
            Products product = productsRepository.findById(item.getPId()).orElse(null);
            if (product == null) return;

            product.setPSold(product.getPSold() - item.getQuantity());

            PSizeColorStock target = product.getSizeColorStock().stream()
                .filter(scs -> scs.getProductSize().equals(item.getProductSizeColorStock().getProductSize())
                            && scs.getProductColor().equals(item.getProductSizeColorStock().getProductColor()))
                .findFirst().orElse(null);
            if (target != null) target.setProductStock(target.getProductStock() + item.getQuantity());
            productsRepository.save(product);
        });

        orderItem.setStatus("Canceled");
        return orderItemRepository.save(orderItem);
    }


    // Additional method to connect with Users
    public List<OrdersItem> getOrderItemsByUserId(Long userId) {
        return orderItemRepository.findByUserId(userId);
    }
}