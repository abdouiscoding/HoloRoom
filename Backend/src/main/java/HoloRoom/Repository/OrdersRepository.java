package HoloRoom.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.Orders;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Orders findByUserId(Long userId);
}