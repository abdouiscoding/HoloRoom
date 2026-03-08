package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PSizeColors;

@Repository
public interface PSizeColorRepository extends JpaRepository<PSizeColors, Long> {
}