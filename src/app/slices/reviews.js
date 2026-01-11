import { createSlice } from '@reduxjs/toolkit';

/**
 * Load reviews from localStorage
 * @returns {Object} Reviews object or empty object if error
 */
const loadReviewsFromStorage = () => {
    try {
        const reviews = localStorage.getItem('productReviews');
        return reviews ? JSON.parse(reviews) : {};
    } catch (error) {
        return {};
    }
};

/**
 * Save reviews to localStorage
 * @param {Object} reviews - Reviews object to save
 */
const saveReviewsToStorage = (reviews) => {
    try {
        localStorage.setItem('productReviews', JSON.stringify(reviews));
    } catch (error) {
        console.error('Failed to save reviews:', error);
    }
};

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        // Reviews structure: { productId: [{review}, {review}] }
        reviews: loadReviewsFromStorage(),
    },
    reducers: {
        /**
         * Add a new review for a product
         * @param {Object} state - Current state
         * @param {Object} action - Action payload containing productId, rating, comment, userName
         */
        addReview: (state, action) => {
            const { productId, rating, comment, userName } = action.payload;
            
            // Initialize product reviews array if it doesn't exist
            if (!state.reviews[productId]) {
                state.reviews[productId] = [];
            }
            
            // Create new review object
            const newReview = {
                id: Date.now(),
                rating,
                comment,
                userName,
                date: new Date().toISOString(),
                isUserReview: true
            };
            
            // Add new review at the beginning of the array
            state.reviews[productId].unshift(newReview);
            
            // Persist to localStorage
            saveReviewsToStorage(state.reviews);
        },
        
        /**
         * Get reviews for a specific product
         * @param {Object} state - Current state
         * @param {Object} action - Action payload containing productId
         * @returns {Array} Array of reviews for the product
         */
        getProductReviews: (state, action) => {
            return state.reviews[action.payload] || [];
        }
    }
});

export const { addReview, getProductReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;