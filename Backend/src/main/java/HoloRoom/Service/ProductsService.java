package HoloRoom.Service;

import java.net.InetAddress;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class ProductsService {

    @Autowired
    private ProductsRepository productsRepository;

    @Autowired
    private PImagesRepository pImagesRepository;

    @Autowired
    private PSizeColorStockService pSizeColorRepository;

    @Autowired
    private PCategoriesRepository pCategoriesRepository;

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

        // 3D model
        if (product.getProduct3DModel() != null &&
            !product.getProduct3DModel().startsWith("http")) {

            product.setProduct3DModel(
                baseUrl + "models/" + product.getProduct3DModel()
            );
        }

        // images
        if (product.getImages() != null) {
            for (PImages img : product.getImages()) {

                if (img.getProductImage() != null &&
                    !img.getProductImage().startsWith("http")) {

                    img.setProductImage(
                        baseUrl + "images/" + img.getProductImage()
                    );
                }
            }
        }

        return product;
    }

    // =========================
    // Retrieve all products
    // =========================
    public List<Products> getAllProducts() {

        List<Products> products = productsRepository.findAll();

        products.forEach(this::buildUrls);

        return products;
    }

    // =========================
    // Get by ID
    // =========================
    public Products getProductById(Long id) {

        Products product = productsRepository.findById(id).orElse(null);

        if (product == null) return null;

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
}