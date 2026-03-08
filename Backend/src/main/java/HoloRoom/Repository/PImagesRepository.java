package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PImages;

@Repository
public interface PImagesRepository extends JpaRepository<PImages, Long> {
}