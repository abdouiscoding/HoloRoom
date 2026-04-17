package HoloRoom.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import HoloRoom.Model.Products;
import HoloRoom.Service.SearchService;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    // GET products by brand
    @GetMapping("/brand")
    public ResponseEntity<List<Products>> searchByBrand(@RequestParam String brand) {
        List<Products> products = searchService.getProductByBrand(brand);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products by status
    @GetMapping("/status")
    public ResponseEntity<List<Products>> searchByStatus(@RequestParam String status) {
        List<Products> products = searchService.getProductByStatus(status);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products by rating
    @GetMapping("/rating")
    public ResponseEntity<List<Products>> searchByRating(@RequestParam double rating) {
        List<Products> products = searchService.getProductByRating(rating);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products by category
    @GetMapping("/category")
    public ResponseEntity<List<Products>> searchByCategory(@RequestParam String category) {
        List<Products> products = searchService.getProductByCategory(category);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products by name (contains search)
    @GetMapping("/name")
    public ResponseEntity<List<Products>> searchByName(@RequestParam String name) {
        List<Products> products = searchService.getProductByName(name);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products by price range
    @GetMapping("/price")
    public ResponseEntity<List<Products>> searchByPriceRange(@RequestParam double Price) {
        List<Products> products = searchService.getProductByPrice(Price);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET products with multiple filters
    @GetMapping("/advanced")
    public ResponseEntity<List<Products>> advancedSearch(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String status) {
        List<Products> products = searchService.advancedSearch(brand, category, minRating, minPrice, maxPrice, status);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
}