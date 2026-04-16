package HoloRoom.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.Products;

@Repository
public interface ProductsRepository extends JpaRepository<Products, Long> {

    List<Products> findByPName(String pName);

    List<Products> findByPBrand(String pBrand);

    List<Products> findByPStatus(String pStatus);

    List<Products> findByPCategories(String pCategories);

    List<Products> findByPPrice(Double pPrice);

    List<Products> findByPRating(Double pRating);

}