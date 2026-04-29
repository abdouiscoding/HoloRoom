// ReviewModal.jsx

import React, { useState } from 'react';
import { X, Star, Send, User } from 'lucide-react';
import { useReviews } from '../../context/ReviewsContext';
import styles from './ReviewModal.module.css';

const ReviewModal = ({ isOpen, onClose, product }) => {
  const { getReviews, addReview } = useReviews();

  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  if (!isOpen || !product) return null;

  const reviews = getReviews(product.pId) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newReviewText.trim()) return;

    await addReview(product.pId, newReviewText, newRating);

    setNewReviewText('');
    setNewRating(5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';

    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h2>Reviews for {product.pName}</h2>
        </div>

        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.pReviewId}
                className={styles.reviewCard}
              >
                <div className={styles.reviewHeader}>
                  <span className={styles.author}>
                    <User
                      size={14}
                      style={{ marginRight: '5px' }}
                    />
                    {review.userName || 'Anonymous'}
                  </span>

                  <span className={styles.date}>
                    {formatDate(review.date)}
                  </span>
                </div>

                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                      key={starValue}
                      size={14}
                      fill={
                        starValue <= review.pRating
                          ? '#ffc107'
                          : 'none'
                      }
                      color={
                        starValue <= review.pRating
                          ? '#ffc107'
                          : '#ccc'
                      }
                    />
                  ))}
                </div>

                <p className={styles.reviewText}>
                  {review.pComment}
                </p>
              </div>
            ))
          )}
        </div>

        <div className={styles.addReviewSection}>
          <h3>Add a Review</h3>

          <form
            onSubmit={handleSubmit}
            className={styles.addReviewForm}
          >
            <div className={styles.ratingSelect}>
              <span>Rating: </span>

              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => setNewRating(starValue)}
                  className={styles.starSelectBtn}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <Star
                    size={20}
                    fill={
                      starValue <= newRating
                        ? '#ffc107'
                        : 'none'
                    }
                    color={
                      starValue <= newRating
                        ? '#ffc107'
                        : '#ccc'
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={newReviewText}
              onChange={(e) =>
                setNewReviewText(e.target.value)
              }
              placeholder="What do you think about this product?"
              required
              rows={3}
              className={styles.reviewInput}
            />

            <button
              type="submit"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'flex-start',
                marginTop: '10px'
              }}
            >
              <Send size={16} />
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;