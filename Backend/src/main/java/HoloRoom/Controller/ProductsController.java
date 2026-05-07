package HoloRoom.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import HoloRoom.Model.PCategories;
import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorStockRepository;
import HoloRoom.Service.PCartItemService;
import HoloRoom.Service.PReviewsService;
import HoloRoom.Service.PWishlistService;
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

    @Autowired 
    private PCartItemService cartItemService;

    @Autowired 
    private PWishlistService wishlistService;

    @Autowired
    private PReviewsService reviewsService;

    //upload
    @PostMapping("/upload-model/{id}")
    public ResponseEntity<?> uploadModel(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            Products p = productsService.uploadModel(id, file);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/upload-image/{id}")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Products p = productsService.uploadImage(id, file);
            return ResponseEntity.ok(p);
        }
        catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }   

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

    // DELETE product
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Products product = productsService.getProductById(id);
        if (product != null) {
            cartItemService.delete(id);
            wishlistService.removebypId(id);
            reviewsService.removebyId(id);
            imagesRepository.deleteAll(product.getImages());
            sizeColorRepository.deleteAll(product.getSizeColorStock());
            productsService.deleteProduct(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    //updates

    @PutMapping("/update-full/{id}")
    public ResponseEntity<Products> updateFull(
            @PathVariable Long id,
            @RequestBody Products body) {

        Products p = productsService.getProductById(id);
        if (p == null) return ResponseEntity.notFound().build();

        // BASIC
        p.setProductName(body.getProductName());
        p.setProductPrice(body.getProductPrice());
        p.setProductBrand(body.getProductBrand());
        p.setProductDescription(body.getProductDescription());

        // CATEGORIES (SAFE)
        if (body.getCategories() != null) {
            List<PCategories> cats = new ArrayList<>();

            for (PCategories c : body.getCategories()) {
                PCategories existing = categoriesRepository
                    .findBypCategory(c.getProductCategory())
                    .orElseGet(() -> categoriesRepository.save(c));

                cats.add(existing);
            }

            p.setCategories(cats);
        }

        // ===== PSCS (FULL REPLACE SAFE) =====
        if (body.getSizeColorStock() != null) {

            // clear old ones
            p.getSizeColorStock().clear();

            for (PSizeColorStock scs : body.getSizeColorStock()) {
                scs.setProduct(p);
                p.getSizeColorStock().add(scs);
            }
        }

        return ResponseEntity.ok(productsService.saveProduct(p));
    }
    @PatchMapping("/update-basic/{id}")
    public ResponseEntity<Products> updateBasic(
            @PathVariable Long id,
            @RequestBody Products body) {

        Products p = productsService.getProductById(id);
        if (p == null) return ResponseEntity.notFound().build();

        p.setProductName(body.getProductName());
        p.setProductPrice(body.getProductPrice());
        p.setProductBrand(body.getProductBrand());
        p.setProductDescription(body.getProductDescription());

        return ResponseEntity.ok(productsService.saveProduct(p));
    }


    @PatchMapping("/ar/{id}")
    public ResponseEntity<?> updateAR(
            @PathVariable Long id,
            @RequestBody Products body) {

        Products p = productsService.getProductById(id);
        if (p == null) return ResponseEntity.notFound().build();

        p.setProductARSupport(body.isProductARSupport());

        return ResponseEntity.ok(productsService.saveProduct(p));
    }

    
}