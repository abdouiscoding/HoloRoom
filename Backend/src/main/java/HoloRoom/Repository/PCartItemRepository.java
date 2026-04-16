package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.PCartItem;

@Repository
public interface PCartItemRepository extends JpaRepository<PCartItem, Long> {
    
}
