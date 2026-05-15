package HoloRoom.Service;

import HoloRoom.Model.Item;
import HoloRoom.Model.OrdersItem;
import HoloRoom.Model.PCart;
import HoloRoom.Model.PCartItem;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.OrdersItemRepository;
import HoloRoom.Repository.PCartRepository;
import HoloRoom.Repository.PSizeColorStockRepository;
import HoloRoom.Repository.ProductsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrdersItemService {

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private OrdersItemRepository orderItemRepository;

    @Autowired
    private PSizeColorStockRepository pscsRepository;

    @Autowired
    private OrdersService ordersService;

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

            PSizeColorStock target = pscsRepository.findById(item.getPscsId()).orElse(null);
            if (target != null) target.setProductStock(target.getProductStock() + item.getQuantity());
            productsRepository.save(product);
        });

        orderItem.setStatus("Canceled");
        return orderItemRepository.save(orderItem);
    }

    @Autowired
    private PCartRepository cartRepository;

    public OrdersItem checkoutFromCart(Long userId, Long cartId) {
        PCart cart = cartRepository.findById(cartId).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return null;
        }

        // 1. Convert cart items -> order items
        List<Item> orderItems = new ArrayList<>();
        for (PCartItem ci : cart.getItems()) {
            Item item = new Item(ci.getProduct().getProductId(), ci.getName(), ci.getPrice(), ci.getQuantity(), ci.getPscs().getPscsId());
            orderItems.add(item);
        }

        // 2. Build the OrdersItem (sets price, status="Pending", date, userId)
        OrdersItem orderItem = new OrdersItem(orderItems, userId);

        // 3. For each item: decrement stock + increment pSold
        for (Item item : orderItems) {
            // pSold
            Products product = productsRepository.findById(item.getPId()).orElse(null);
            if (product != null) {
                product.addtoPSold(item.getQuantity());
                productsRepository.save(product);
            }

            // stock on the specific size/color row
            PSizeColorStock pscs = pscsRepository.findById(item.getPscsId()).orElse(null);
            if (pscs != null) {
                int newStock = Math.max(0, pscs.getProductStock() - item.getQuantity());
                pscs.setProductStock(newStock);
                // PSizeColorStock will be saved as part of Products cascade,
                // OR if you have a PSizeColorStockRepository, save explicitly
            }
        }

        // 4. Save order item + attach to user's Orders list
        OrdersItem saved = orderItemRepository.save(orderItem);
        ordersService.addorderitemtolist(userId, saved);

        // 5. Clear the cart
        cartRepository.deleteById(cartId);

        return saved;
    }


    // Additional method to connect with Users
    public List<OrdersItem> getOrderItemsByUserId(Long userId) {
        return orderItemRepository.findByUserId(userId);
    }
}