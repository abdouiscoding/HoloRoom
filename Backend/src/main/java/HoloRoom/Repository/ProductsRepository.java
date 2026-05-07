package HoloRoom.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import HoloRoom.Model.Products;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ProductsRepository extends JpaRepository<Products, Long> {

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM product_categories WHERE category_id = :id", nativeQuery = true)
    void removeCategoryRelations(@Param("id") Long id);
    
    List<Products> findByPName(String pName);
    List<Products> findByPBrand(String pBrand);
    List<Products> findByPStatus(String pStatus);
    List<Products> findBySizecolorstock_PscsId(Long pscsId);
    List<Products> findByCategories_pCategory(String pCategory);
    List<Products> findByPPrice(Double pPrice);
    List<Products> findByPRating(Double pRating);
    //List<Products> findByPPriceBetween(double minPrice, double maxPrice);
}