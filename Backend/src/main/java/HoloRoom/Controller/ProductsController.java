package HoloRoom.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HoloRoom.Model.PCategories;
import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColors;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorRepository;
import HoloRoom.Service.ProductsService;

@RestController
@RequestMapping("/api/products")
public class ProductsController {

    @Autowired
    private ProductsService productsService;

    @Autowired
    private PImagesRepository imagesRepository;

    @Autowired
    private PSizeColorRepository sizeColorRepository;

    @Autowired
    private PCategoriesRepository categoriesRepository;

    // GET all products
    @GetMapping
    public ResponseEntity<List<Products>> getAllProducts() {
        List<Products> products = productsService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Products> getProductById(@PathVariable Long id) {
        Products product = productsService.getProductById(id);
        return product != null
                ? new ResponseEntity<>(product, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // POST create product
    @PostMapping
    public ResponseEntity<Products> createProduct(@RequestBody Products product) {

        // Save product first to generate ID
        Products savedProduct = productsService.saveProduct(product);

        // Link OneToMany children
        if (product.getImages() != null) {
            for (PImages img : product.getImages()) {
                img.setProduct(savedProduct);
                imagesRepository.save(img);
            }
            savedProduct.setImages(product.getImages());
        }

        if (product.getSizeColors() != null) {
            for (PSizeColors sc : product.getSizeColors()) {
                sc.setProduct(savedProduct);
                sizeColorRepository.save(sc);
            }
            savedProduct.setSizeColors(product.getSizeColors());
        }

        // Link ManyToMany categories
        /*if (product.getCategories() != null) {
            for (PCategories cat : product.getCategories()) {
                PCategories existing = categoriesRepository
                        .findByPCategory(cat.getProductCategory())
                        .orElseGet(() -> categoriesRepository.save(cat));
                savedProduct.getCategories().add(existing);
            }
            productsService.saveProduct(savedProduct);
        }*/

        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    // PUT update product
    @PutMapping("/{id}")
    public ResponseEntity<Products> updateProduct(@PathVariable Long id,
                                                  @RequestBody Products productDetails) {
        Products product = productsService.getProductById(id);
        if (product == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        // Update basic fields
        product.setProductName(productDetails.getProductName());
        product.setProductPrice(productDetails.getProductPrice());
        product.setProductBrand(productDetails.getProductBrand());
        product.setProduct3DModel(productDetails.getProduct3DModel());
        product.setProductStock(productDetails.getProductStock());
        product.setProductDescription(productDetails.getProductDescription());
        product.setProductStatus(productDetails.getProductStatus());

        // Update OneToMany children
        if (productDetails.getImages() != null) {
            imagesRepository.deleteAll(product.getImages());
            for (PImages img : productDetails.getImages()) {
                img.setProduct(product);
                imagesRepository.save(img);
            }
            product.setImages(productDetails.getImages());
        }

        if (productDetails.getSizeColors() != null) {
            sizeColorRepository.deleteAll(product.getSizeColors());
            for (PSizeColors sc : productDetails.getSizeColors()) {
                sc.setProduct(product);
                sizeColorRepository.save(sc);
            }
            product.setSizeColors(productDetails.getSizeColors());
        }

        /*// Update ManyToMany categories
        if (productDetails.getCategories() != null) {
            product.getCategories().clear();
            for (PCategories cat : productDetails.getCategories()) {
                PCategories existing = categoriesRepository
                        .findByPCategory(cat.getProductCategory())
                        .orElseGet(() -> categoriesRepository.save(cat));
                product.getCategories().add(existing);
            }
        }*/

        Products updatedProduct = productsService.saveProduct(product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // DELETE product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Products product = productsService.getProductById(id);
        if (product != null) {
            imagesRepository.deleteAll(product.getImages());
            sizeColorRepository.deleteAll(product.getSizeColors());
            productsService.deleteProduct(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}