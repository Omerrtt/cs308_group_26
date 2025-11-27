import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../app/slices/products';

const CartPersistence = () => {
    const dispatch = useDispatch();
    const { carts } = useSelector((state) => state.products);
    const { status, user } = useSelector((state) => state.user);

    // Load cart on mount or user change
    useEffect(() => {
        let storageKey = 'cart_guest';
        if (status && user.email) {
            storageKey = `cart_${user.email}`;
        }

        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                dispatch(setCart({ carts: parsedCart }));
            } catch (e) {
                console.error("Failed to parse cart from storage", e);
            }
        } else {
            // If no cart in storage for this user/guest, clear the current cart in state
            // This prevents guest cart from leaking into user cart if we don't merge
            dispatch(setCart({ carts: [] }));
        }
    }, [dispatch, status, user.email]);

    // Save cart on change
    useEffect(() => {
        let storageKey = 'cart_guest';
        if (status && user.email) {
            storageKey = `cart_${user.email}`;
        }

        localStorage.setItem(storageKey, JSON.stringify(carts));
    }, [carts, status, user.email]);

    return null;
};

export default CartPersistence;
