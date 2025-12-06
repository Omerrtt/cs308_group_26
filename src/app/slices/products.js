import { createSlice } from "@reduxjs/toolkit";
// Demo Data
import { getProductsData } from '../data/productsData'
// Alert
import Swal from "sweetalert2";

// Product Slice
const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: getProductsData(),
        carts: [],
        favorites: [],
        compare: [],
        single: null,
    },
    reducers: {
        // Get Single Product
        getProductById: (state, action) => {
            let { id } = action.payload;
            let arr = state.products.find(item => item.id === parseInt(id))
            state.single = arr
        },
        // Add to Cart
        addToCart: (state, action) => {

            let { id } = action.payload;

            // Check existance
            let item = state.carts.find(i => i.id === parseInt(id))
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => item.id === parseInt(id))
                arr.quantity = 1
                state.carts.push(arr)
                Swal.fire({
                    title: 'Başarılı!',
                    text: 'Sepetinize başarıyla eklendi',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500
                })

            } else {
                Swal.fire({
                    title: 'Başarısız!',
                    text: 'Bu ürün zaten sepetinizde mevcut',
                    imageUrl: item.img,
                    imageWidth: 200,
                    imageAlt: item.title,
                    showConfirmButton: false,
                    timer: 5000
                })
            }
        },
        // Add to Compare
        addToComp: (state, action) => {
            if (state.compare.length >= 3) {
                Swal.fire({
                    title: 'Başarısız!',
                    text: 'Karşılaştırma listesi dolu',
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
                    title: 'Başarılı!',
                    text: 'Karşılaştırma listesine eklendi',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500,
                })
            } else {
                Swal.fire({
                    title: 'Başarısız!',
                    text: 'Zaten karşılaştırma listesinde',
                    imageUrl: item.img,
                    imageWidth: 200,
                    imageAlt: item.title,
                    showConfirmButton: false,
                    timer: 5000,
                })
            }
        },
        // Update Cart
        updateCart: (state, action) => {
            let { val, id } = action.payload;
            state.carts.forEach(item => {
                if (item.id === parseInt(id)) {
                    item.quantity = val
                }
            })

        },
        // Remove Cart
        removeCart: (state, action) => {
            let { id } = action.payload;
            let arr = state.carts.filter(item => item.id !== parseInt(id))
            state.carts = arr

        },
        // Delete from Compare
        delCompare: (state, action) => {
            let { id } = action.payload;
            let arr = state.compare.filter(item => item.id !== parseInt(id))
            state.compare = arr

        },
        // Clear Cart
        clearCart: (state) => {
            state.carts = []
        },
        // Add to Favorite / Wishlist
        addToFav: (state, action) => {
            let { id } = action.payload;

            // Check existance
            let item = state.favorites.find(i => i.id === parseInt(id))
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => item.id === parseInt(id))
                arr.quantity = 1
                state.favorites.push(arr)
                Swal.fire('Başarılı', "Favorilere eklendi", 'success')
            } else {
                Swal.fire('Başarısız', "Zaten favorilerde", 'warning')
            }
        },
        // Remove from Favorite / Wishlist
        removeFav: (state, action) => {
            let { id } = action.payload;
            let arr = state.favorites.filter(item => item.id !== id)
            state.favorites = arr

        },
        // Set Cart (for persistence)
        setCart: (state, action) => {
            state.carts = action.payload.carts;
        },
    }
})

const productsReducer = productsSlice.reducer
export const {
    getProductById,
    addToCart,
    addToComp,
    updateCart,
    removeCart,
    delCompare,
    clearCart,
    addToFav,
    removeFav,
    setCart
} = productsSlice.actions;
export default productsReducer
