package HoloRoom.Controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import HoloRoom.Model.Orders;
import HoloRoom.Model.OrdersItem;
import HoloRoom.Repository.OrdersRepository;
import HoloRoom.Service.OrdersItemService;
import HoloRoom.Service.OrdersService;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    @Autowired
    private OrdersService ordersService;

    @Autowired
    private OrdersItemService ordersItemService;

    // GET orders List
    @GetMapping("/get")
    public ResponseEntity<List<Orders>> getAllOrders() {
        List<Orders> orders = ordersService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // GET order item by id
    @GetMapping("/get/{ordersId}")
    public ResponseEntity<OrdersItem> getOrderById(@PathVariable Long ordersId) {
        OrdersItem order = ordersItemService.getOrderItemById(ordersId);
        return order != null
                ? new ResponseEntity<>(order, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // GET order items by user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrdersItem>> getOrderItemsByUserId(@PathVariable Long userId) {
        List<OrdersItem> orderItems = ordersItemService.getOrderItemsByUserId(userId);
        return new ResponseEntity<>(orderItems, HttpStatus.OK);
    }

    // POST create order item /add it to user list
    @PostMapping("/create/{userId}")
    public ResponseEntity<OrdersItem> createOrderItem(@PathVariable Long userId, @RequestBody OrdersItem orderItem) {
        try {
            OrdersItem savedOrderItem = ordersItemService.saveOrderItem(orderItem);
            ordersService.addorderitemtolist(userId,savedOrderItem);
            return new ResponseEntity<>(savedOrderItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // PUT update order item status
    @PutMapping("/update/status/{orderItemId}")
    public ResponseEntity<OrdersItem> updateOrderItemStatus(@PathVariable Long orderItemId, @RequestBody UpdateStatusRequest request) {
        try {
            OrdersItem updatedOrderItem = ordersItemService.updateOrderItemStatus(orderItemId, request.getStatus());
            return updatedOrderItem != null
                    ? new ResponseEntity<>(updatedOrderItem, HttpStatus.OK)
                    : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE order item
    @DeleteMapping("/delete/{orderItemId}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable Long orderItemId) {
        try {
            ordersItemService.deleteOrderItem(orderItemId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // GET order items from orders list
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrdersItem>> getOrderItems(@PathVariable Long orderId) {
        List<OrdersItem> items = ordersService.getAllOrderItems(orderId);
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @PutMapping("/cancel/{orderItemId}")
    public ResponseEntity<OrdersItem> cancelOrderItem(@PathVariable Long orderItemId) {
        try {
            OrdersItem canceled = ordersItemService.cancelOrderItem(orderItemId);
            return canceled != null
                    ? new ResponseEntity<>(canceled, HttpStatus.OK)
                    : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/checkout/{userId}")
    public ResponseEntity<OrdersItem> checkoutFromCart(
            @PathVariable Long userId,
            @RequestBody CheckoutRequest request) {
        try {
            OrdersItem saved = ordersItemService.checkoutFromCart(userId, request.getCartId());
            return saved != null
                    ? new ResponseEntity<>(saved, HttpStatus.CREATED)
                    : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DTO at the bottom of the class
    public static class CheckoutRequest {
        private Long cartId;
        private String paymentMethod;

        public Long getCartId() { return cartId; }
        public void setCartId(Long cartId) { this.cartId = cartId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    // Request DTO
    public static class UpdateStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
