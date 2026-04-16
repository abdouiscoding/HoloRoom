package HoloRoom.Controller;

import java.util.List;

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

import HoloRoom.Model.PReviews;
import HoloRoom.Service.PReviewsService;

@RestController
@RequestMapping("/api/reviews")
public class PReviewsController {

    @Autowired
    private PReviewsService reviewsService;

    // POST add review
    @PostMapping("/add")
    public ResponseEntity<PReviews> addReview(@RequestBody PReviews review) {
        try {
            PReviews savedReview = reviewsService.addReview(review);
            return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // GET reviews by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<PReviews>> getReviewsByProductId(@PathVariable Long productId) {
        List<PReviews> reviews = reviewsService.getReviewsByProductId(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // PUT update review
    @PutMapping("/update/{reviewId}")
    public ResponseEntity<PReviews> updateReview(@PathVariable Long reviewId, @RequestBody PReviews reviewDetails) {
        try {
            PReviews updatedReview = reviewsService.updateReview(reviewId, reviewDetails);
            return updatedReview != null
                    ? new ResponseEntity<>(updatedReview, HttpStatus.OK)
                    : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE review
    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        boolean deleted = reviewsService.deleteReview(reviewId);
        return deleted
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
