package HoloRoom.Controller;

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
import HoloRoom.Service.PCategoriesService;

@RestController
@RequestMapping("/api/categories")
public class PCategoriesController {

    @Autowired
    private PCategoriesService categoriesService;

    // GET all categories
    @GetMapping("/get")
    public ResponseEntity<List<PCategories>> getAllCategories() {
        List<PCategories> categories = categoriesService.getAllCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // GET category by ID
    @GetMapping("/get/{categoryId}")
    public ResponseEntity<PCategories> getCategoryById(@PathVariable Long categoryId) {
        Optional<PCategories> category = categoriesService.getCategoryById(categoryId);
        return category.map(c -> new ResponseEntity<>(c, HttpStatus.OK))
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // GET category by name
    @GetMapping("/name/{categoryName}")
    public ResponseEntity<PCategories> getCategoryByName(@PathVariable String categoryName) {
        Optional<PCategories> category = categoriesService.getCategoryByName(categoryName);
        return category.map(c -> new ResponseEntity<>(c, HttpStatus.OK))
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // POST create category
    @PostMapping("/create")
    public ResponseEntity<PCategories> createCategory(@RequestBody PCategories category) {
        try {
            PCategories savedCategory = categoriesService.createCategory(category);
            return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // PUT update category
    @PutMapping("/update/{categoryId}")
    public ResponseEntity<PCategories> updateCategory(@PathVariable Long categoryId, @RequestBody PCategories categoryDetails) {
        try {
            PCategories updatedCategory = categoriesService.updateCategory(categoryId, categoryDetails);
            return updatedCategory != null
                    ? new ResponseEntity<>(updatedCategory, HttpStatus.OK)
                    : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE category
    @DeleteMapping("/delete/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        boolean deleted = categoriesService.deleteCategory(categoryId);
        return deleted
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
