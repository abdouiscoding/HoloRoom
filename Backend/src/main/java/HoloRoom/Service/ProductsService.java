package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorStockRepository;
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

    // Retrieve all products
    public List<Products> getAllProducts() {
        return productsRepository.findAll();
    }

    // Retrieve product images
    public List<PImages> getProductImages(Long productId) {

        Products product = productsRepository.findById(productId).orElse(null);

        if (product == null) {
            return null;
        }

        return product.getImages();
    }

    // Retrieve sizes/colors/stock
    public List<PSizeColorStock> getProductSizeColorStocks(Long productId) {

        Products product = productsRepository.findById(productId).orElse(null);

        if (product == null) {
            return null;
        }

        return product.getSizeColorStock();
    }

    // Save product
    public Products saveProduct(Products product) {
        return productsRepository.save(product);
    }

    // Get by ID
    public Products getProductById(Long id) {
        return productsRepository.findById(id).orElse(null);
    }

    // Delete
    public void deleteProduct(Long id) {
        productsRepository.deleteById(id);
    }
}