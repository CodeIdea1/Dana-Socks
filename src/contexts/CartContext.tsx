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
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    stock: number;
    category: string;
    quantity: number;
    product?: Product; // للتوافق مع الكود الحالي
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
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart');
            const savedWishlist = localStorage.getItem('wishlist');

            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (error) {
                    console.error('Error parsing cart from localStorage:', error);
                }
            }

            if (savedWishlist) {
                try {
                    setWishlistItems(JSON.parse(savedWishlist));
                } catch (error) {
                    console.error('Error parsing wishlist from localStorage:', error);
                }
            }
        }
    }, []);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // إضافة المنتج كـ CartItem مع كل البيانات اللازمة
            const newCartItem: CartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                description: product.description,
                stock: product.stock,
                category: product.category,
                quantity: 1,
                product: product // للتوافق مع الكود الحالي
            };

            return [...prev, newCartItem];
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.id === productId
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
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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