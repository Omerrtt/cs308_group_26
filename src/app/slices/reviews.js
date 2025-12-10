import { createSlice } from '@reduxjs/toolkit';

const loadReviewsFromStorage = () => {
    try {
        const reviews = localStorage.getItem('productReviews');
        return reviews ? JSON.parse(reviews) : {};
    } catch (error) {
        return {};
    }
};

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
        reviews: loadReviewsFromStorage(), // { productId: [{review}, {review}] }
    },
    reducers: {
        addReview: (state, action) => {
            const { productId, rating, comment, userName } = action.payload;
            
            if (!state.reviews[productId]) {
                state.reviews[productId] = [];
            }
            
            const newReview = {
                id: Date.now(),
                rating,
                comment,
                userName,
                date: new Date().toISOString(),
                isUserReview: true
            };
            
            // Add new review at the beginning
            state.reviews[productId].unshift(newReview);
            
            saveReviewsToStorage(state.reviews);
        },
        
        getProductReviews: (state, action) => {
            return state.reviews[action.payload] || [];
        }
    }
});

export const { addReview, getProductReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;