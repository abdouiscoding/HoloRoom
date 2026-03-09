package HoloRoom.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.PCategories;

@Repository
public interface PCategoriesRepository extends JpaRepository<PCategories, Long> {
    Optional<PCategories> findBypCategory(String pCategory);
}