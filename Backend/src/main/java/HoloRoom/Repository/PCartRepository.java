package HoloRoom.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PCart;

@Repository
public interface PCartRepository extends JpaRepository<PCart, Long> {
    Optional<PCart> findByuserId(String userId);
}
