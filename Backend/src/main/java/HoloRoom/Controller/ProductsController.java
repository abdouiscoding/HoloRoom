package HoloRoom.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorStockRepository;
import HoloRoom.Service.ProductsService;

@RestController
@RequestMapping("/api/products")
public class ProductsController {

    @Autowired
    private ProductsService productsService;

    @Autowired
    private PImagesRepository imagesRepository;

    @Autowired
    private PSizeColorStockRepository sizeColorRepository;

    @Autowired
    private PCategoriesRepository categoriesRepository;

    // GET all products
    @GetMapping("/get")
    public ResponseEntity<List<Products>> getAllProducts() {
        List<Products> products = productsService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // GET product by ID
    @GetMapping("/get/{id}")
    public ResponseEntity<Products> getProductById(@PathVariable Long id) {
        Products product = productsService.getProductById(id);
        return product != null
                ? new ResponseEntity<>(product, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/create")
    public ResponseEntity<Products> createProduct(@RequestBody Products product) {
    
    // 1. Link OneToMany (Images)
    if (product.getImages() != null) {
        for (PImages img : product.getImages()) {
            img.setProduct(product);
        }
    }

    // 2. Link OneToMany (SizeColors)
    if (product.getSizeColorStock() != null) {
        for (PSizeColorStock scs : product.getSizeColorStock()) {
            scs.setProduct(product);
        }
    }

    // 3. Handle ManyToMany (Categories)
    if (product.getCategories() != null) {
        List<PCategories> persistedCategories = new ArrayList<>();
        for (PCategories cat : product.getCategories()) {
            // Find existing category by name so we don't duplicate "Hoodie"
            PCategories existing = categoriesRepository
                    .findBypCategory(cat.getProductCategory()) 
                    .orElseGet(() -> categoriesRepository.save(cat));
            persistedCategories.add(existing);
        }
        product.setCategories(persistedCategories);
    }

    Products savedProduct = productsService.saveProduct(product);
    return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
}

    // PUT update product
    @PutMapping("/update/{id}")
    public ResponseEntity<Products> updateProduct(@PathVariable Long id,
                                                  @RequestBody Products productDetails) {
        Products product = productsService.getProductById(id);
        if (product == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        // Update basic fields
        product.setProductName(productDetails.getProductName());
        product.setProductPrice(productDetails.getProductPrice());
        product.setProductBrand(productDetails.getProductBrand());
        product.setProduct3DModel(productDetails.getProduct3DModel());
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

        if (productDetails.getSizeColorStock() != null) {
            sizeColorRepository.deleteAll(product.getSizeColorStock());
            for (PSizeColorStock scs : productDetails.getSizeColorStock()) {
                scs.setProduct(product);
                sizeColorRepository.save(scs);
            }
            product.setSizeColorStock(productDetails.getSizeColorStock());
        }

        // Update ManyToMany categories
        if (productDetails.getCategories() != null) {
            product.getCategories().clear();
            for (PCategories cat : productDetails.getCategories()) {
                PCategories existing = categoriesRepository
                        .findBypCategory(cat.getProductCategory())
                        .orElseGet(() -> categoriesRepository.save(cat));
                product.getCategories().add(existing);
            }
        }

        Products updatedProduct = productsService.saveProduct(product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // DELETE product
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Products product = productsService.getProductById(id);
        if (product != null) {
            imagesRepository.deleteAll(product.getImages());
            sizeColorRepository.deleteAll(product.getSizeColorStock());
            productsService.deleteProduct(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}