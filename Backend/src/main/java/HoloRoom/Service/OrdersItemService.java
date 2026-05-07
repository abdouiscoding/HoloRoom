package HoloRoom.Service;

import HoloRoom.Model.OrdersItem;
import HoloRoom.Model.PCart;
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

    orderItem.getCart()
        .getItems()
        .forEach(item -> {
            Products product = item.getProduct();
            product.addtoPSold(item.getQuantity());
            productsRepository.save(product); // persist change
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
    public PCart getCartItemsByOrderId(Long orderId) {
        OrdersItem orderItem = getOrderItemById(orderId);
        if (orderItem != null) {
            return orderItem.getCart();
        }
        return null;
    }


    // Additional method to connect with Users
    public List<OrdersItem> getOrderItemsByUserId(Long userId) {
        return orderItemRepository.findByUserId(userId);
    }
}