package HoloRoom.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;   
import HoloRoom.Model.PWishlistItem;

@Repository
public interface PWishlistItemRepository extends JpaRepository<PWishlistItem, Long> {
    List<PWishlistItem> findByProductId(Long productId);
}
