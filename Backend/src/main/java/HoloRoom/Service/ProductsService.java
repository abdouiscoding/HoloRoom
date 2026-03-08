package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PImages;
import HoloRoom.Model.PSizeColors;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.PImagesRepository;
import HoloRoom.Repository.PSizeColorRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class ProductsService {
    
    @Autowired
    private ProductsRepository ProductsRepository;
    @Autowired
    private PImagesRepository PImagesRepository;
    @Autowired
    private PSizeColorRepository PSizeColorRepository;
    @Autowired
    private PCategoriesRepository PCatigoriesRepository;
    
    // Retrieve all products from database
    public List<Products> getAllProducts() {
        return ProductsRepository.findAll();
    }

    // Retrieve all product's images 
    public List<PImages> getProductImages(Long productId) {

    Products product = ProductsRepository.findById(productId).orElse(null);

    if(product == null){
        return null;
    }

    return product.getImages();
   }

    // Retrieve all product's sizes and colors
    public List<PSizeColors> getProductSizes(Long productId) {

    Products product = ProductsRepository.findById(productId).orElse(null);

    if(product == null){
        return null;
    }

    return product.getSizeColors();
   }

    // Save a new product or update existing one
    public Products saveProduct(Products product) {
        ProductsRepository.save(product);
        return product;
    }
    
    // Get a single product by ID
    public Products getProductById(Long id) {
        return ProductsRepository.findById(id).orElse(null);
    }
    
    // Delete a product by ID
    public void deleteProduct(Long id) {
        ProductsRepository.deleteById(id);
    }
}