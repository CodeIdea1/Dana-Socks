'use client';
// contexts/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    stock: number;
    category: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    wishlistItems: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    getTotalPrice: () => number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    wishlistItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    addToWishlist: () => { },
    removeFromWishlist: () => { },
    getTotalPrice: () => 0,
    clearCart: () => { },
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    // Load from localStorage on component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedWishlist = localStorage.getItem('wishlist');

        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }

        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
        }
    }, []);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const addToWishlist = (product: Product) => {
        setWishlistItems(prev => {
            if (prev.find(item => item.id === product.id)) {
                return prev;
            }
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            wishlistItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            addToWishlist,
            removeFromWishlist,
            getTotalPrice,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};