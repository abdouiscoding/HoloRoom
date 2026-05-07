package HoloRoom.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.FeaturedItem;

@Repository
public interface FeaturedItemRepository extends JpaRepository<FeaturedItem, Long> {
}

