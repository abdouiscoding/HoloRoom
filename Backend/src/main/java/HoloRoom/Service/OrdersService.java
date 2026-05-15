package HoloRoom.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import HoloRoom.Model.Orders;
import HoloRoom.Model.OrdersItem;
import HoloRoom.Repository.OrdersRepository;
import java.math.BigDecimal;
import java.util.ArrayList;

@Service
public class OrdersService {

    @Autowired
    private OrdersRepository ordersRepository;

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    public Orders getOrdersById(Long id) {
        return ordersRepository.findById(id).orElse(null);
    }

    public List<OrdersItem> getAllOrderItems(Long orderId) {
        Orders order = getOrdersById(orderId);
        return order != null ? order.getOrderItems() : List.of();
    }

    public void saveOrders(Orders order) {
        ordersRepository.save(order);
    }


    public void deleteOrders(Long id) {
        ordersRepository.deleteById(id);
    }

    public Orders getOrdersByUserId(Long userId) {
        return ordersRepository.findByUserId(userId);
    }

    public void addorderitemtolist(Long userId, OrdersItem item) {
        Orders orderlist = ordersRepository.findByUserId(userId);

        if (orderlist == null) {
            orderlist = new Orders(userId, BigDecimal.ZERO);
            orderlist.setOrderItems(new ArrayList<>());
        } else if (orderlist.getOrderItems() == null) {
            orderlist.setOrderItems(new ArrayList<>());
        }

        item.setOrder(orderlist);       // owning side — this is what actually persists the link
        orderlist.getOrderItems().add(item);

        saveOrders(orderlist);
    }

}
