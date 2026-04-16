package HoloRoom.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.PReviews;

@Repository
public interface PReviewsRepository extends JpaRepository<PReviews, Long> {
    List<PReviews> findByProduct_ProductId(Long productId);
}
