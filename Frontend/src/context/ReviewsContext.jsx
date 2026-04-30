// ReviewsContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { Navigate } from 'react-router-dom';

// the ip address
const address = "192.168.1.10"

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAllReviews = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://${address}:8080/api/reviews/all`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        const grouped = data.reduce((acc, review) => {
          const id = review.productId;

          if (id !== undefined && id !== null) {
            if (!acc[id]) acc[id] = [];

            acc[id].push(review);
          }

          return acc;
        }, {});

        setReviews(grouped);
      } else {
        console.error(
          `Failed to fetch reviews: ${response.status}`
        );
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const addReview = async (
    productId,
    reviewText,
    rating
  ) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://${address}:8080/api/reviews/add/${productId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
              ? `Bearer ${token}`
              : ''
          },
          body: JSON.stringify({
            userName: localStorage.userName,
            pRating: parseInt(rating),
            pComment: reviewText
          })
        }
      );

      if (response.ok) {
        await fetchAllReviews();

        return { success: true };
      }

      return {
        success: false,
        error: 'Failed to add review'
      };
    } catch (error) {
      console.error('Error adding review:', error);

      return {
        success: false,
        error
      };
    }};

  const getReviews = (productId) => {
    return reviews[productId] || [];
  };

  const getAverageRating = (productId) => {
    const productReviews = reviews[productId] || [];

    if (productReviews.length === 0) return 0;

    const total = productReviews.reduce(
      (sum, r) => sum + (r.pRating || 0),
      0
    );

    return (
      total / productReviews.length
    ).toFixed(1);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        addReview,
        getReviews,
        getAverageRating,
        refreshReviews: fetchAllReviews
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};