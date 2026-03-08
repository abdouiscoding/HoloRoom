package HoloRoom.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HoloRoom.Model.Products;

@Repository
public interface ProductsRepository extends JpaRepository<Products, Long> {

    Optional<Products> findByPName(String pName);

}