package HoloRoom.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import HoloRoom.Model.PCategories;
import HoloRoom.Repository.PCategoriesRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class PCategoriesService {

    @Autowired
    private PCategoriesRepository categoriesRepository;

    @Autowired
    private ProductsRepository productsRepository;

    public List<PCategories> getAllCategories() {
        return categoriesRepository.findAll();
    }

    public Optional<PCategories> getCategoryById(Long categoryId) {
        return categoriesRepository.findById(categoryId);
    }

    public Optional<PCategories> getCategoryByName(String categoryName) {
        return categoriesRepository.findBypCategory(categoryName);
    }

    public PCategories createCategory(PCategories category) {
        return categoriesRepository.save(category);
    }

    public PCategories updateCategory(Long categoryId, PCategories categoryDetails) {
        Optional<PCategories> categoryOpt = categoriesRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            PCategories category = categoryOpt.get();
            category.setProductCategory(categoryDetails.getProductCategory());
            return categoriesRepository.save(category);
        }
        return null;
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        System.out.println("🔥 DELETE REQUEST FOR CATEGORY ID: " + categoryId);

        PCategories cat = categoriesRepository.findById(categoryId)
            .orElseThrow(() -> {
                System.out.println("❌ CATEGORY NOT FOUND");
                return new RuntimeException("Category not found");
            });

        System.out.println("✅ FOUND CATEGORY: " + cat.getProductCategory());

        // 🔥 FAST: remove all relations in one query
        productsRepository.removeCategoryRelations(categoryId);

        System.out.println("⚡ Removed relations from product_categories");

        // now delete
        categoriesRepository.delete(cat);

        System.out.println("🗑️ CATEGORY DELETED SUCCESSFULLY");
    }
}
