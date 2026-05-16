package HoloRoom.Service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import HoloRoom.Model.Discounts;
import HoloRoom.Model.PCategories;
import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class ProductsService {

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private PCategoriesRepository pCategoriesRepository;

    @Autowired
    private DiscountsService discountsService; 

    @Autowired
    private SupabaseStorageService supabaseStorageService;


    //upload services
    public Products uploadImage(Long id, MultipartFile file) throws Exception {

        Products product = getProductById(id);

        String imageUrl =
            supabaseStorageService.uploadFile(file, "Products_Images");

        PImages img = new PImages();

        img.setProduct(product);

        img.setProductImage(imageUrl);

        product.getImages().add(img);

        return productsRepository.save(product);
    }

    public Products uploadModel(Long id, MultipartFile file) throws Exception {

        Products product = getProductById(id);

        String modelUrl =
            supabaseStorageService.uploadFile(file, "Products_Models");

        product.setProduct3DModel(modelUrl);

        return productsRepository.save(product);
    }

    public Products updatePlacement(Long id, String placement) {

        Products product = getProductById(id);

        product.setProductPlacement(placement);

        return productsRepository.save(product);
    }

    public Products updateSize(Long id, float width, float height) {

        Products product = getProductById(id);

        product.setPWidth(width);
        product.setPHeight(height);

        return productsRepository.save(product);
    }


    public List<Products> applyalldiscounts(List<Products> products) {

    List<Discounts> globaldis = discountsService.getglobaldis();

    // max global discount
    float globalDiscounts = globaldis.stream()
        .filter(Discounts::isActive)
        .map(Discounts::getPercentage)
        .filter(Objects::nonNull)
        .max(Float::compare)
        .orElse(0);

    for (Products item : products) {
        List<Discounts> productDis = discountsService.getproductdis(item.getProductId());

        float productDiscounts = productDis.stream()
            .filter(Discounts::isActive)
            .map(Discounts::getPercentage)
            .filter(Objects::nonNull)
            .max(Float::compare)
            .orElse(0);

        float productDiscount ;

        if(productDiscounts == 0f || productDis.size() == 0){
            productDiscount = item.getProductDiscount();
        }
        else {
            Products p = productsRepository.findById(item.getProductId()).orElse(null);
            productDiscount = productDiscounts;
            p.setProductDiscount(productDiscount);
        }

        float totalDiscount = productDiscount + globalDiscounts;

        // cap at 80%
        totalDiscount = Math.min(totalDiscount, 80f);

        float finalPrice = Math.round(
            item.getProductPrice() * (1 - totalDiscount / 100f)
        );

        item.setProductFinalPrice(finalPrice);
    }

    return products;
}


public Products applypdiscounts(Products product) {

    List<Discounts> globaldis = discountsService.getglobaldis();

    // max global discount
    float globalDiscounts = globaldis.stream()
        .filter(Discounts::isActive)
        .map(Discounts::getPercentage)
        .filter(Objects::nonNull)
        .max(Float::compare)
        .orElse(0);

        List<Discounts> productDis = discountsService.getproductdis(product.getProductId());

        float productDiscounts = productDis.stream()
            .filter(Discounts::isActive)
            .map(Discounts::getPercentage)
            .filter(Objects::nonNull)
            .max(Float::compare)
            .orElse(0);

        float productDiscount ;

        if(productDiscounts == 0f || productDis.size() == 0){
            productDiscount = product.getProductDiscount();
        }
        else {
            Products p = productsRepository.findById(product.getProductId()).orElse(null);
            productDiscount = productDiscounts;
            p.setProductDiscount(productDiscount);
        }

        float totalDiscount = productDiscount + globalDiscounts;

        // cap at 80%
        totalDiscount = Math.min(totalDiscount, 80f);

        float finalPrice = Math.round(
            product.getProductPrice() * (1 - totalDiscount / 100f)
        );

        product.setProductFinalPrice(finalPrice);

    return product;
}
    // =========================
    // Retrieve all products
    // =========================
    public List<Products> getAllProducts() {

        List<Products> products = productsRepository.findAll();
        products = applyalldiscounts(products);

        return products;
    }

    // =========================
    // Get by ID
    // =========================
    public Products getProductById(Long id) {

        Products product = productsRepository.findById(id).orElse(null);

        if (product == null) return null;
        product = applypdiscounts(product);

        return product;
    }

    // =========================
    // Retrieve images
    // =========================
    public List<PImages> getProductImages(Long productId) {

        Products product = getProductById(productId);

        if (product == null) return null;

        return product.getImages();
    }

    // =========================
    // Retrieve stock
    // =========================
    public List<PSizeColorStock> getProductSizeColorStocks(Long productId) {

        Products product = getProductById(productId);

        if (product == null) return null;

        return product.getSizeColorStock();
    }

    // =========================
    // Save product
    // =========================
    public Products saveProduct(Products product) {
        return productsRepository.save(product);
    }

    // =========================
    // Delete
    // =========================
    public void deleteProduct(Long id) {

        Products product = getProductById(id);

        if (product == null) {
            return;
        }

        // delete all images from supabase
        if (product.getImages() != null) {

            for (PImages img : product.getImages()) {

                if (img.getProductImage() != null) {
                    supabaseStorageService.deleteFile(
                        img.getProductImage()
                    );
                }
            }
        }

        // delete 3d model from supabase
        if (product.getProduct3DModel() != null) {

            supabaseStorageService.deleteFile(
                product.getProduct3DModel()
            );
        }

        // delete db product
        productsRepository.deleteById(id);
    }
    
    public PCategories getCategoryById(Long pcId) {
    return pCategoriesRepository.findById(pcId)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + pcId));
    }
}