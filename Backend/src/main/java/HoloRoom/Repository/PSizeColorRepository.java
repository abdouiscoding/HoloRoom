package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PSizeColor;

@Repository
public interface PSizeColorRepository extends JpaRepository<PSizeColor, Long> {
}