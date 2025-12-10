import { configureStore } from '@reduxjs/toolkit';
import productsReducer from "./slices/products";
import settingsReducer from "./slices/settings";
import userReducer from "./slices/user";
import ordersReducer from "./slices/orders";
import reviewsReducer from "./slices/reviews";

export const store = configureStore({
  reducer: {
     products: productsReducer,
     user: userReducer,
     settings: settingsReducer,
     orders: ordersReducer,
     reviews: reviewsReducer,
  },
});