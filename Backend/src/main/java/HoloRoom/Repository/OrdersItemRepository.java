package HoloRoom.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.OrdersItem;

@Repository
public interface OrdersItemRepository extends JpaRepository<OrdersItem, Long> {
    List<OrdersItem> findByUserId(Long userId);
}
