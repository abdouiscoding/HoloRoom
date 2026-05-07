package HoloRoom.Service;

import java.net.InetAddress;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadPoolExecutor.DiscardOldestPolicy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import HoloRoom.Model.Discounts;
import HoloRoom.Model.PCategories;
import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.DiscountsRepository;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class ProductsService {

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private PCategoriesRepository pCategoriesRepository;

    @Autowired
    private DiscountsService discountsService; 

    private static final String IMAGE_DIR =
    "C:\\Users\\abder\\Desktop\\HoloRoom\\Backend\\src\\main\\java\\HoloRoom\\Uploads\\Pimages";

    private static final String MODEL_DIR =
    "C:\\Users\\abder\\Desktop\\HoloRoom\\Backend\\src\\main\\java\\HoloRoom\\Uploads\\Pmodels";


    //upload services
    public Products uploadImage(Long id, MultipartFile file) throws Exception {

        Products product = getProductById(id);

        String cleanName = URLEncoder.encode(file.getOriginalFilename(), StandardCharsets.UTF_8);
        String filename = System.currentTimeMillis() + "_" + cleanName;
        Path path = Paths.get(IMAGE_DIR, filename);

        Files.write(path, file.getBytes());

        PImages img = new PImages();
        img.setProduct(product);
        img.setProductImage(filename);

        product.getImages().add(img);

        return productsRepository.save(product);
    }

    public Products uploadModel(Long id, MultipartFile file) throws Exception {

        Products product = getProductById(id);

        String cleanName = URLEncoder.encode(file.getOriginalFilename(), StandardCharsets.UTF_8);
        String filename = System.currentTimeMillis() + "_" + cleanName;
        Path path = Paths.get(MODEL_DIR, filename);

        Files.write(path, file.getBytes());

        product.setProduct3DModel(filename);

        return productsRepository.save(product);
    }

    // =========================
    // GET CURRENT IP
    // =========================
    private String getCurrentIp() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "localhost";
        }
    }

    private String getBaseUrl() {
        return "http://" + getCurrentIp() + ":8080/api/uploads/";
    }

   // =========================
    // BUILD URLS
    // =========================
    private Products buildUrls(Products product) {

        String baseUrl = getBaseUrl();

        // =========================
        // 3D MODEL
        // =========================
        if (product.getProduct3DModel() != null &&
            !product.getProduct3DModel().equals("null")) {

            String model = product.getProduct3DModel();

            // keep only filename
            if (model.contains("/")) {
                model = model.substring(model.lastIndexOf("/") + 1);
            }

            product.setProduct3DModel(
                baseUrl + "models/" + model
            );
        }

        // =========================
        // IMAGES
        // =========================
        if (product.getImages() != null) {

            for (PImages img : product.getImages()) {

                if (img.getProductImage() != null &&
                    !img.getProductImage().equals("null")) {

                    String image = img.getProductImage();

                    // keep only filename
                    if (image.contains("/")) {
                        image = image.substring(image.lastIndexOf("/") + 1);
                    }

                    img.setProductImage(
                        baseUrl + "images/" + image
                    );
                }
            }
        }

        return product;
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

        products.forEach(this::buildUrls);

        return products;
    }

    // =========================
    // Get by ID
    // =========================
    public Products getProductById(Long id) {

        Products product = productsRepository.findById(id).orElse(null);

        if (product == null) return null;
        product = applypdiscounts(product);

        return buildUrls(product);
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
        productsRepository.deleteById(id);
    }

    public PCategories getCategoryById(Long pcId) {
    return pCategoriesRepository.findById(pcId)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + pcId));
    }
}