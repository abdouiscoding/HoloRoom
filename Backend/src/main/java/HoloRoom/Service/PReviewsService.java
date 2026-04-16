package HoloRoom.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import HoloRoom.Model.PReviews;
import HoloRoom.Model.Products;
import HoloRoom.Repository.PReviewsRepository;
import HoloRoom.Repository.ProductsRepository;

@Service
public class PReviewsService {

    @Autowired
    private PReviewsRepository reviewsRepository;

    @Autowired
    private ProductsRepository productsRepository;

    public List<PReviews> getProductReviews(Long productId) {
        return reviewsRepository.findByProduct_PId(productId);
    }

    public PReviews addReview(PReviews review) {
        if (review.getProduct() == null || review.getProduct().getProductId() == null) {
            return null;
        }
        Products product = productsRepository.findById(review.getProduct().getProductId()).orElse(null);
        if (product == null) {
            return null;
        }
        review.setProduct(product);
        PReviews savedReview = reviewsRepository.save(review);
        // Update product rating
        updateProductRating(review.getProduct().getProductId());
        return savedReview;
    }

    public List<PReviews> getReviewsByProductId(Long productId) {
        return getProductReviews(productId);
    }

    public PReviews updateReview(Long reviewId, PReviews reviewDetails) {
        PReviews existingReview = reviewsRepository.findById(reviewId).orElse(null);
        if (existingReview == null) {
            return null;
        }
        existingReview.setpRating(reviewDetails.getpRating());
        existingReview.setpComment(reviewDetails.getpComment());
        PReviews updatedReview = reviewsRepository.save(existingReview);
        // Update product rating
        updateProductRating(existingReview.getProduct().getProductId());
        return updatedReview;
    }

    public boolean deleteReview(Long reviewId) {
        PReviews review = reviewsRepository.findById(reviewId).orElse(null);
        if (review != null) {
            Long productId = review.getProduct().getProductId();
            reviewsRepository.deleteById(reviewId);
            // Update product rating after deletion
            updateProductRating(productId);
            return true;
        }
        return false;
    }

    private void updateProductRating(Long productId) {
        List<PReviews> reviews = getProductReviews(productId);
        if (reviews != null && !reviews.isEmpty()) {
            double averageRating = reviews.stream()
                .mapToInt(PReviews::getpRating)
                .average()
                .orElse(0.0);
            Products product = productsRepository.findById(productId).orElse(null);
            if (product != null) {
                product.setProductRating(averageRating);
                productsRepository.save(product);
            }
        }
    }
}
