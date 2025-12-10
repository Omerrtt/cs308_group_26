import {createSlice} from "@reduxjs/toolkit";

// localStorage'dan auth state'i yükle
const AUTH_STORAGE_KEY = 'cs308_auth_state';

const loadAuthFromStorage = () => {
    if (typeof window === 'undefined') return { status: false, user: {} };
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Eğer 24 saatten eskiyse geçersiz say
            if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                return { status: parsed.status || false, user: parsed.user || {} };
            }
        }
    } catch (error) {
        console.error('Auth state yükleme hatası:', error);
    }
    return { status: false, user: {} };
};

const saveAuthToStorage = (status, user) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
            status,
            user,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Auth state kaydetme hatası:', error);
    }
};

const clearAuthFromStorage = () => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.error('Auth state temizleme hatası:', error);
    }
};

// User Slice
const userSlice = createSlice({
    name: 'user',
    initialState: loadAuthFromStorage(),
    reducers: {
        // Login
        login: (state) => {
            state.status = true
            state.user = {
                name: 'Jhon Doe',
                role: 'customer',
                email: 'jhondoe@gmail.com',
                pass:'jhondoe123'
            }
            // localStorage'a kaydet
            saveAuthToStorage(state.status, state.user);
        },
        // Register
        register: (state, action) => {
            let { user, email, pass } = action.payload;
            state.status = true
            state.user = {
                name: user,
                role: 'customer',
                email: email,
                pass: pass
            }
            // localStorage'a kaydet
            saveAuthToStorage(state.status, state.user);
        },
        // Logout
        logout: (state) => {
            state.status = false
            state.user = {}
            // localStorage'dan temizle
            clearAuthFromStorage();
        }
    }
})

const userReducer = userSlice.reducer
export const { login, register, logout } = userSlice.actions
export default userReducer
