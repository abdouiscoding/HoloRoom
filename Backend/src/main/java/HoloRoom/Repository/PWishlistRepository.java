package HoloRoom.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.PWishlist;
import java.util.List;


@Repository
public interface PWishlistRepository extends JpaRepository<PWishlist, Long> {
    Optional<PWishlist> findByUserId(Long userId);

    List<PWishlist> findByWName(String wName);
}

