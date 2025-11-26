import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
// Demo Data
import { getProductsData, getProductsDataSync, fetchProductsFromFirebase } from '../data/productsData'
// Alert
import Swal from "sweetalert2";

const CART_STORAGE_KEY = 'cs308_persisted_cart';

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

const loadCartFromStorage = () => {
    if (!canUseStorage()) return [];
    try {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Cart load failed', error);
        return [];
    }
};

const saveCartToStorage = (carts) => {
    if (!canUseStorage()) return;
    try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
    } catch (error) {
        console.error('Cart save failed', error);
    }
};

// Async thunk: Firebase'den ürünleri yükle
export const loadProductsFromFirebase = createAsyncThunk(
    'products/loadFromFirebase',
    async () => {
        const products = await getProductsData();
        return products;
    }
);

// Product Slice
const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: getProductsDataSync() || [], // İlk yükleme için senkron versiyon (JSON'dan)
        carts: loadCartFromStorage(),
        favorites: [],
        compare: [],
        single: null,
        loading: false,
        error: null,
    },
    reducers: {
        // Get Single Product
        getProductById: (state, action) => {
            let { id } = action.payload;
            if (!Array.isArray(state.products)) {
                console.warn('⚠️ Redux getProductById: products array değil');
                state.single = null;
                return;
            }
            const searchId = parseInt(id, 10);
            let arr = state.products.find(item => {
                const itemId = item.id || item.originalId;
                return itemId === searchId || itemId === id || item.originalId === id;
            });
            state.single = arr || null;
        },
        // Add to Cart
        addToCart: (state, action) =>{

            let { id, quantity = 1 } = action.payload;
            const numericId = parseInt(id);
            const normalizedQuantity = quantity > 0 ? quantity : 1;

            const product = state.products.find(item => item.id === numericId)
            if (!product) {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Product could not be found.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 3000
                })
                return;
            }

            const parsedStock = typeof product.stock === 'number'
                ? product.stock
                : parseInt(product.stock, 10);
            const hasStockInfo = Number.isFinite(parsedStock);

            if (hasStockInfo && parsedStock <= 0) {
                Swal.fire({
                    title: 'Stok Yok',
                    text: 'Bu ürün şu anda stokta bulunmuyor.',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 3000
                })
                return;
            }

            const limitedQuantity = hasStockInfo
                ? Math.min(normalizedQuantity, parsedStock)
                : normalizedQuantity;

            if (hasStockInfo && normalizedQuantity > parsedStock) {
                Swal.fire({
                    title: 'Stok Sınırı',
                    text: `En fazla ${parsedStock} adet ekleyebilirsiniz.`,
                    icon: 'info',
                    showConfirmButton: false,
                    timer: 3000
                })
            }

            // Check existance
            let item = state.carts.find(i => i.id === numericId)
            if (item === undefined) {
                const cartItem = { ...product, quantity: limitedQuantity }
                state.carts.push(cartItem)
                saveCartToStorage(state.carts)
                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully added to your Cart',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500
                  })

            }else{
                Swal.fire({
                    title: 'Failed!',
                    text: 'This product is already added in your Cart',
                    imageUrl: item.img,
                    imageWidth: 200,
                    imageAlt: item.title,
                    showConfirmButton: false,
                    timer: 5000
                  })
            }
        },
        // Add to Compare
        addToComp: (state, action) =>{
            if (state.compare.length >= 3) {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Compare List is Full',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500,
                  })
                return;
            }

            let { id } = action.payload;

            // Check existance
            let item = state.compare.find(i => i.id === parseInt(id))
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => item.id === parseInt(id))
                state.compare.push(arr)
                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully added to Compare List',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500,
                  })
            }else{
                    Swal.fire({
                        title: 'Failed!',
                        text: 'Already Added in Compare List',
                        imageUrl: item.img,
                        imageWidth: 200,
                        imageAlt: item.title,
                        showConfirmButton: false,
                        timer: 5000,
                    })
              }
        },
        // Update Cart
        updateCart: (state, action) =>{
            let { val, id } = action.payload;
            state.carts.forEach(item => {
                if(item.id === parseInt(id)){
                    item.quantity = val
                }
            })
            saveCartToStorage(state.carts)

        },
        // Remove Cart
        removeCart: (state, action) =>{
            let { id } = action.payload;
            let arr = state.carts.filter(item => item.id !== parseInt(id))
            state.carts = arr
            saveCartToStorage(state.carts)
            
        },
        // Delete from Compare
        delCompare: (state, action) =>{
            let { id } = action.payload;
            let arr = state.compare.filter(item => item.id !== parseInt(id))
            state.compare = arr
            
        },
        // Clear Cart
        clearCart: (state) =>{
            state.carts = []
            saveCartToStorage(state.carts)
        },
        // Add to Favorite / Wishlist
        addToFav: (state, action) =>{
            let { id } = action.payload;

            // Check existance
            let item = state.favorites.find(i => i.id === parseInt(id))
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => item.id === parseInt(id))
                arr.quantity = 1
                state.favorites.push(arr)
                Swal.fire('Success', "Added to Wishlist", 'success')
            }else{
                  Swal.fire('Failed', "Already Added in Wishlist", 'warning')
              }
        },
        // Remove from Favorite / Wishlist
        removeFav: (state, action) =>{
            let { id } = action.payload;
            let arr = state.favorites.filter(item => item.id !== id)
            state.favorites = arr
            
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadProductsFromFirebase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadProductsFromFirebase.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
                console.log(`✅ Redux Store: ${action.payload.length} ürün Firebase'den yüklendi ve store'a eklendi`);
            })
            .addCase(loadProductsFromFirebase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                console.error('Firebase ürün yükleme hatası:', action.error);
            });
    }
})

const productsReducer = productsSlice.reducer
export default productsReducer
