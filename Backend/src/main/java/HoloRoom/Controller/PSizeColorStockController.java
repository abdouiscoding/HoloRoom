package HoloRoom.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Service.PSizeColorStockService;

@RestController
@RequestMapping("/api/stock")
public class PSizeColorStockController {

    @Autowired
    private PSizeColorStockService pscsService;

    // Get all variants for a specific product
    // GET http://localhost:8080/api/stock/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<PSizeColorStock>> getProductVariants(@PathVariable Long productId) {
        List<PSizeColorStock> variants = pscsService.getProductSizeColorStocks(productId);
        return ResponseEntity.ok(variants);
    }

    // Get a single variant detail by ID
    // GET http://localhost:8080/api/stock/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PSizeColorStock> getVariantById(@PathVariable Long id) {
        return pscsService.getSizeColorStockById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Save a new variant or update existing
    // POST http://localhost:8080/api/stock/save
    @PostMapping("/save")
    public ResponseEntity<PSizeColorStock> saveVariant(@RequestBody PSizeColorStock pscs) {
        return ResponseEntity.ok(pscsService.saveSizeColorStock(pscs));
    }

    // Quick update for stock quantity
    // PATCH http://localhost:8080/api/stock/update/{id}?newStock=50
    @PatchMapping("/update/{id}")
    public ResponseEntity<String> updateStockQuantity(@PathVariable Long id, @RequestParam int newStock) {
        try {
            pscsService.updateStock(id, newStock);
            return ResponseEntity.ok("Stock updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Delete a variant
    // DELETE http://localhost:8080/api/stock/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        pscsService.deleteSizeColorStock(id);
        return ResponseEntity.noContent().build();
    }
}