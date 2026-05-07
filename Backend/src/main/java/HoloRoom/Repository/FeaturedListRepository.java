package HoloRoom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.FeaturedList;

@Repository
public interface FeaturedListRepository extends JpaRepository<FeaturedList, Long> {
    FeaturedList findByName(String name);
}

