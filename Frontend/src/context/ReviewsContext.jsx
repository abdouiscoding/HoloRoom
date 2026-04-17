import React, { createContext, useContext, useState, useEffect } from 'react';

const ReviewsContext = createContext();

export const useReviews = () => {
    return useContext(ReviewsContext);
};

export const ReviewsProvider = ({ children }) => {
    const [reviews, setReviews] = useState(() => {
        const saved = localStorage.getItem('holoroom_reviews');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('holoroom_reviews', JSON.stringify(reviews));
    }, [reviews]);

    const addReview = (productId, reviewText, rating) => {
        setReviews(prev => {
            const productReviews = prev[productId] || [];
            const newReview = {
                id: Date.now(),
                text: reviewText,
                rating: rating,
                date: new Date().toISOString(),
                authorName: "Current User" // Simple hardcoded since no real auth
            };
            return {
                ...prev,
                [productId]: [newReview, ...productReviews]
            };
        });
    };

    const getReviews = (productId) => {
        return reviews[productId] || [];
    };

    const getAverageRating = (productId) => {
        const productReviews = reviews[productId] || [];
        if (productReviews.length === 0) return 0;
        const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
        return (total / productReviews.length).toFixed(1);
    };

    return (
        <ReviewsContext.Provider value={{
            reviews,
            addReview,
            getReviews,
            getAverageRating
        }}>
            {children}
        </ReviewsContext.Provider>
    );
};
