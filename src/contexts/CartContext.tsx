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
    addToCart: (product: Product) => boolean;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    getTotalPrice: () => number;
    clearCart: () => void;
    validateCartItem: (item: CartItem) => boolean;
    getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    wishlistItems: [],
    addToCart: () => false,
    removeFromCart: () => { },
    updateQuantity: () => { },
    addToWishlist: () => { },
    removeFromWishlist: () => { },
    getTotalPrice: () => 0,
    clearCart: () => { },
    validateCartItem: () => false,
    getCartItemsCount: () => 0,
});

export const useCart = () => useContext(CartContext);

// دالة للتحقق من صحة بيانات المنتج
const validateProduct = (product: any): product is Product => {
    if (!product) {
        console.error('Product is null or undefined');
        return false;
    }

    const requiredFields = ['id', 'name', 'price'];
    const missingFields = requiredFields.filter(field => !product[field]);

    if (missingFields.length > 0) {
        console.error('Product missing required fields:', missingFields, product);
        return false;
    }

    // التحقق من أن السعر رقم صحيح
    if (typeof product.price !== 'number' || isNaN(product.price) || product.price < 0) {
        console.error('Product has invalid price:', product.price, product);
        return false;
    }

    return true;
};

// دالة لتنظيف وتصحيح بيانات المنتج
const sanitizeProduct = (product: any): Product => {
    return {
        id: String(product.id || '').trim(),
        name: String(product.name || 'منتج غير معروف').trim(),
        price: parseFloat(product.price) || 0,
        imageUrl: String(product.imageUrl || '').trim(),
        description: String(product.description || '').trim(),
        stock: parseInt(product.stock) || 0,
        category: String(product.category || 'عام').trim(),
    };
};

// دالة للتحقق من صحة عنصر السلة
const validateCartItem = (item: any): boolean => {
    if (!item) return false;

    return !!(
        item.id &&
        item.name &&
        item.name !== 'اسم المنتج غير متوفر' &&
        typeof item.price === 'number' &&
        !isNaN(item.price) &&
        item.price > 0 &&
        typeof item.quantity === 'number' &&
        !isNaN(item.quantity) &&
        item.quantity > 0
    );
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    // Load from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedCart = localStorage.getItem('cart');
                const savedWishlist = localStorage.getItem('wishlist');

                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    // تنظيف وتصحيح العناصر المحفوظة
                    const validCartItems = parsedCart
                        .filter((item: any) => validateCartItem(item))
                        .map((item: any) => ({
                            ...item,
                            price: parseFloat(item.price) || 0,
                            quantity: parseInt(item.quantity) || 1,
                        }));

                    setCartItems(validCartItems);

                    // إذا كان هناك عناصر غير صحيحة، قم بتحديث localStorage
                    if (validCartItems.length !== parsedCart.length) {
                        localStorage.setItem('cart', JSON.stringify(validCartItems));
                        console.warn('تم إزالة عناصر غير صحيحة من السلة');
                    }
                }

                if (savedWishlist) {
                    const parsedWishlist = JSON.parse(savedWishlist);
                    const validWishlistItems = parsedWishlist
                        .filter((item: any) => validateProduct(item))
                        .map((item: any) => sanitizeProduct(item));

                    setWishlistItems(validWishlistItems);
                }
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
                // مسح البيانات الفاسدة
                localStorage.removeItem('cart');
                localStorage.removeItem('wishlist');
            }
        }
    }, []);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // فقط حفظ العناصر الصحيحة
                const validItems = cartItems.filter(item => validateCartItem(item));
                localStorage.setItem('cart', JSON.stringify(validItems));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [cartItems]);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            } catch (error) {
                console.error('Error saving wishlist to localStorage:', error);
            }
        }
    }, [wishlistItems]);

    const addToCart = (product: Product): boolean => {
        // التحقق من صحة المنتج قبل الإضافة
        if (!validateProduct(product)) {
            console.error('Cannot add invalid product to cart:', product);
            alert('لا يمكن إضافة هذا المنتج للسلة - بيانات المنتج غير مكتملة');
            return false;
        }

        // تنظيف بيانات المنتج
        const sanitizedProduct = sanitizeProduct(product);

        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === sanitizedProduct.id);

            if (existingItem) {
                // التحقق من المخزون
                if (existingItem.quantity >= sanitizedProduct.stock) {
                    alert(`لا يمكن إضافة المزيد - المخزون المتاح: ${sanitizedProduct.stock}`);
                    return prev;
                }

                return prev.map(item =>
                    item.id === sanitizedProduct.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // إضافة المنتج كـ CartItem مع كل البيانات اللازمة
            const newCartItem: CartItem = {
                id: sanitizedProduct.id,
                name: sanitizedProduct.name,
                price: sanitizedProduct.price,
                imageUrl: sanitizedProduct.imageUrl,
                description: sanitizedProduct.description,
                stock: sanitizedProduct.stock,
                category: sanitizedProduct.category,
                quantity: 1,
                product: sanitizedProduct // للتوافق مع الكود الحالي
            };

            return [...prev, newCartItem];
        });

        return true;
    };

    const removeFromCart = (productId: string) => {
        if (!productId) {
            console.error('Cannot remove item - invalid productId');
            return;
        }

        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (!productId) {
            console.error('Cannot update quantity - invalid productId');
            return;
        }

        const numQuantity = parseInt(String(quantity)) || 0;

        if (numQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev =>
            prev.map(item => {
                if (item.id === productId) {
                    // التحقق من المخزون
                    if (numQuantity > item.stock) {
                        alert(`الكمية المطلوبة تتجاوز المخزون المتاح: ${item.stock}`);
                        return item;
                    }
                    return { ...item, quantity: numQuantity };
                }
                return item;
            })
        );
    };

    const addToWishlist = (product: Product) => {
        if (!validateProduct(product)) {
            console.error('Cannot add invalid product to wishlist:', product);
            return;
        }

        const sanitizedProduct = sanitizeProduct(product);

        setWishlistItems(prev => {
            if (prev.find(item => item.id === sanitizedProduct.id)) {
                return prev;
            }
            return [...prev, sanitizedProduct];
        });
    };

    const removeFromWishlist = (productId: string) => {
        if (!productId) return;
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
    };

    const getTotalPrice = (): number => {
        try {
            const total = cartItems.reduce((total, item) => {
                // التحقق من صحة البيانات
                const price = parseFloat(String(item.price)) || 0;
                const quantity = parseInt(String(item.quantity)) || 0;

                if (isNaN(price) || isNaN(quantity)) {
                    console.warn('Invalid price or quantity for item:', item);
                    return total;
                }

                return total + (price * quantity);
            }, 0);

            return isNaN(total) ? 0 : total;
        } catch (error) {
            console.error('Error calculating total price:', error);
            return 0;
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartItemsCount = (): number => {
        return cartItems.reduce((count, item) => count + (parseInt(String(item.quantity)) || 0), 0);
    };

    // تنظيف السلة من العناصر غير الصحيحة دوريًا
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            setCartItems(prev => {
                const validItems = prev.filter(item => validateCartItem(item));
                if (validItems.length !== prev.length) {
                    console.warn('تم إزالة عناصر غير صحيحة من السلة');
                }
                return validItems;
            });
        }, 30000); // كل 30 ثانية

        return () => clearInterval(cleanupInterval);
    }, []);

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
            validateCartItem,
            getCartItemsCount,
        }}>
            {children}
        </CartContext.Provider>
    );
};