package HoloRoom.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import HoloRoom.Model.PSizeColorStock;
import HoloRoom.Repository.PSizeColorStockRepository;

@Service
public class PSizeColorStockService {
    @Autowired
    private PSizeColorStockRepository pSizeColorStockRepository;

    // Retrieve all size/color/stock entries for a product
    public List<PSizeColorStock> getProductSizeColorStocks(Long productId) {
        return pSizeColorStockRepository.findByProduct_PId(productId);
    }

    // Retrieve specific size/color/stock entry by ID
    public Optional<PSizeColorStock> getSizeColorStockById(Long id) {
        return pSizeColorStockRepository.findById(id);
    }

    // Save or update size/color/stock entry
    public PSizeColorStock saveSizeColorStock(PSizeColorStock pscs) {
        return pSizeColorStockRepository.save(pscs);
    }

    // Delete size/color/stock entry by ID
    public void deleteSizeColorStock(Long id) {
        pSizeColorStockRepository.deleteById(id);
    }

    // Update stock quantity for a specific size/color entry
    public void updateStock(Long id, int newStock) {
        PSizeColorStock pscs = pSizeColorStockRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Size/Color entry not found"));
        pscs.setProductStock(newStock);
        pSizeColorStockRepository.save(pscs);
    }
}