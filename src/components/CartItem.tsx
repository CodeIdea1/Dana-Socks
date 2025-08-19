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
        if (newQuantity < 1) {
            removeFromCart(item.product.id);
        } else {
            updateQuantity(item.product.id, newQuantity);
        }
    };

    return (
        <div className={styles.cartItem}>
            <div className={styles.productImage}>
                <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className={styles.image}
                />
            </div>

            <div className={styles.productDetails}>
                <h3 className={styles.productName}>{item.product.name}</h3>
                <p className={styles.productDescription}>{item.product.description}</p>
                <div className={styles.price}>{item.product.price} ج.م</div>
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
                {item.product.price * item.quantity} ج.م
            </div>

            <button
                onClick={() => removeFromCart(item.product.id)}
                className={styles.removeBtn}
            >
                حذف
            </button>
        </div>
    );
}