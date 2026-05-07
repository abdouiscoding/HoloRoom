package HoloRoom.Service;

import HoloRoom.Model.Discounts;
import HoloRoom.Model.Products;
import HoloRoom.Repository.DiscountsRepository;
import HoloRoom.Repository.ProductsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DiscountsService {

    @Autowired
    private DiscountsRepository repo;

    @Autowired 
    private ProductsRepository productrepo;

    public DiscountsService(DiscountsRepository repo) {
        this.repo = repo;
    }

    public Discounts create(Discounts d) {

    Discounts saved = repo.save(d);

    return saved;
    }

    public List<Discounts> getAll() {
        return repo.findAll();
    }

    public List<Discounts> getglobaldis() {
        return repo.findAll()
                .stream()
                .filter(Discounts::isActive)
                .filter(dis -> dis.getProductId() == null)
                .toList();
    }

    public List<Discounts> getproductdis(Long id) {
        return repo.findAll()
                .stream()
                .filter(Discounts::isActive)
                .filter(dis -> dis.getProductId() == id)
                .toList();
    }


    public Discounts getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        Discounts discount = repo.findById(id).orElse(null);
        Long pid = discount.getProductId();
        if (pid != null) {
            Products p = productrepo.findById(pid).orElse(null);
            p.setProductDiscount(0);
        }
        repo.deleteById(id);
    }
    public Discounts save(Discounts d) {
        return repo.save(d);
    }
}