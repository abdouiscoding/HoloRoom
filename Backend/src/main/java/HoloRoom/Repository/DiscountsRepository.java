package HoloRoom.Repository;

import HoloRoom.Model.Discounts;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountsRepository extends JpaRepository<Discounts, Long> {
    List<Discounts> findByProductId(Long productId);
}