'use client';

// components/CartItem.tsx
import { CartItem as CartItemType, useCart } from '@/contexts/CartContext';
import styles from './CartItem.module.css';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (newQuantity: number) => {
        // استخدام optional chaining والnullish coalescing
        const productId = item.product?.id;
        if (!productId) {
            console.error('Product or Product ID is undefined');
            return;
        }

        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    // التحقق من وجود product قبل عرض المكون
    if (!item.product) {
        return (
            <div className={styles.cartItem}>
                <div className={styles.error}>خطأ: المنتج غير موجود</div>
            </div>
        );
    }

    return (
        <div className={styles.cartItem}>
            <div className={styles.productImage}>
                <img
                    src={item.product?.imageUrl || '/placeholder-image.jpg'}
                    alt={item.product?.name || 'منتج'}
                    className={styles.image}
                />
            </div>

            <div className={styles.productDetails}>
                <h3 className={styles.productName}>{item.product?.name || 'اسم المنتج غير متوفر'}</h3>
                <p className={styles.productDescription}>{item.product?.description || ''}</p>
                <div className={styles.price}>{item.product?.price || 0} ج.م</div>
            </div>

            <div className={styles.quantityControls}>
                <button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    className={styles.quantityBtn}
                >
                    -
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    className={styles.quantityBtn}
                >
                    +
                </button>
            </div>

            <div className={styles.itemTotal}>
                {(item.product?.price || 0) * item.quantity} ج.م
            </div>

            <button
                onClick={() => {
                    const productId = item.product?.id;
                    if (productId) removeFromCart(productId);
                }}
                className={styles.removeBtn}
            >
                حذف
            </button>
        </div>
    );
}