import { createSlice } from '@reduxjs/toolkit';

const loadOrdersFromStorage = () => {
    try {
        const orders = localStorage.getItem('userOrders');
        return orders ? JSON.parse(orders) : [];
    } catch (error) {
        return [];
    }
};

const saveOrdersToStorage = (orders) => {
    try {
        localStorage.setItem('userOrders', JSON.stringify(orders));
    } catch (error) {
        console.error('Failed to save orders:', error);
    }
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: loadOrdersFromStorage(),
    },
    reducers: {
        addOrder: (state, action) => {
            const newOrder = {
                id: Date.now(),
                date: new Date().toISOString(),
                status: 'Processing',
                ...action.payload
            };
            state.orders.unshift(newOrder);
            saveOrdersToStorage(state.orders);
        },
        updateOrderStatus: (state, action) => {
            const { id, status } = action.payload;
            const order = state.orders.find(o => o.id === id);
            if (order) {
                order.status = status;
                saveOrdersToStorage(state.orders);
            }
        },
        clearOrders: (state) => {
            state.orders = [];
            localStorage.removeItem('userOrders');
        }
    }
});

export const { addOrder, updateOrderStatus, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;