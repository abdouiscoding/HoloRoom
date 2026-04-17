package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.Products;
import HoloRoom.Repository.ProductsRepository;

@Service
public class SearchService {

    @Autowired
    private ProductsRepository productsRepository;

    public List<Products> getProductByName(String pName) {
        return productsRepository.findByPName(pName);
    }

    public List<Products> getProductByBrand(String pBrand) {
        return productsRepository.findByPBrand(pBrand);
    }

    public List<Products> getProductByStatus(String pStatus) {
        return productsRepository.findByPStatus(pStatus);
    }

    public List<Products> getProductByCategories(String pCategories) {
        return productsRepository.findByCategories_pCategory(pCategories);
    }

    public List<Products> getProductByPrice(Double pPrice) {
        return productsRepository.findByPPrice(pPrice);
    }

    public List<Products> getProductByRating(Double pRating) {
        return productsRepository.findByPRating(pRating);
    }

    public List<Products> getProductByCategory(String category) {
        return getProductByCategories(category);
    }

    public List<Products> advancedSearch(
            String brand,
            String category,
            Double minRating,
            Double minPrice,
            Double maxPrice,
            String status) {

        List<Products> allProducts = productsRepository.findAll();

        return allProducts.stream()
                .filter(p -> brand == null || p.getProductBrand().equalsIgnoreCase(brand))
                .filter(p -> category == null || p.getCategories()
                        .stream()
                        .anyMatch(c -> c.getProductCategory().equalsIgnoreCase(category)))
                .filter(p -> minRating == null || p.getProductRating() >= minRating)
                .filter(p -> minPrice == null || p.getProductPrice().compareTo(new java.math.BigDecimal(minPrice)) >= 0)
                .filter(p -> maxPrice == null || p.getProductPrice().compareTo(new java.math.BigDecimal(maxPrice)) <= 0)
                .filter(p -> status == null || p.getProductStatus().equalsIgnoreCase(status))
                .toList();
    }
}