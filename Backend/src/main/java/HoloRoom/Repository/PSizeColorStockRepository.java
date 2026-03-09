package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PSizeColorStock;

@Repository
public interface PSizeColorStockRepository extends JpaRepository<PSizeColorStock, Long> {
}