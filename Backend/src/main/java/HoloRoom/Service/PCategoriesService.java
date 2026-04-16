package HoloRoom.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import HoloRoom.Model.PCategories;
import HoloRoom.Repository.PCategoriesRepository;

@Service
public class PCategoriesService {

    @Autowired
    private PCategoriesRepository categoriesRepository;

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

    public boolean deleteCategory(Long categoryId) {
        if (categoriesRepository.existsById(categoryId)) {
            categoriesRepository.deleteById(categoryId);
            return true;
        }
        return false;
    }
}
