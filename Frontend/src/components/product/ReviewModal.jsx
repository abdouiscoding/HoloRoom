import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useReviews } from '../../context/ReviewsContext';
import styles from './ReviewModal.module.css';

const ReviewModal = ({ isOpen, onClose, product }) => {
  const { getReviews, addReview } = useReviews();
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  
  if (!isOpen || !product) return null;

  const reviews = getReviews(product.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReviewText.trim()) {
      addReview(product.id, newReviewText, newRating);
      setNewReviewText('');
      setNewRating(5);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className={styles.modalHeader}>
          <h2>Reviews for {product.name}</h2>
        </div>

        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.author}>{review.authorName}</span>
                  <span className={styles.date}>{formatDate(review.date)}</span>
                </div>
                <div className={styles.reviewStars}>
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      size={14} 
                      fill={star <= review.rating ? "var(--accent-secondary)" : "none"} 
                      color={star <= review.rating ? "var(--accent-secondary)" : "var(--text-muted)"} 
                    />
                  ))}
                </div>
                <p className={styles.reviewText}>{review.text}</p>
              </div>
            ))
          )}
        </div>

        <div className={styles.addReviewSection}>
          <h3>Add a Review</h3>
          <form onSubmit={handleSubmit} className={styles.addReviewForm}>
            <div className={styles.ratingSelect}>
              <span>Rating: </span>
              {[1,2,3,4,5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={styles.starSelectBtn}
                >
                  <Star 
                    size={20} 
                    fill={star <= newRating ? "var(--accent-secondary)" : "none"} 
                    color={star <= newRating ? "var(--accent-secondary)" : "var(--text-muted)"} 
                  />
                </button>
              ))}
            </div>
            <textarea 
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="What do you think about this product?"
              required
              rows={3}
              className={styles.reviewInput}
            />
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
              <Send size={16} /> Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
