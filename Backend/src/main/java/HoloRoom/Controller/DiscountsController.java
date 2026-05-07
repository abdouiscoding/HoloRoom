package HoloRoom.Controller;

import HoloRoom.Model.Discounts;
import HoloRoom.Model.Orders;
import HoloRoom.Model.Products;
import HoloRoom.Service.DiscountsService;
import HoloRoom.Service.ProductsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountsController {

    @Autowired
    private DiscountsService discountsService;

    @GetMapping("/active")
    public ResponseEntity<List<Discounts>> getactive() {
        List<Discounts> discounts = discountsService.getglobaldis();
        return ResponseEntity.ok(discounts);
    }

    // CREATE DISCOUNT (sitewide or product-specific)
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Discounts d) {
        Discounts dis = discountsService.create(d);
        return ResponseEntity.ok(dis);
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Discounts>> getAll() {
        return ResponseEntity.ok(discountsService.getAll());
    }

    // DELETE DISCOUNT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        discountsService.delete(id);
        return ResponseEntity.ok().build();
    }
}