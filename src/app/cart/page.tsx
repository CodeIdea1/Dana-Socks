'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/CartItem';
import styles from './cart.module.css';

export default function CartPage() {
    const { cartItems, getTotalPrice } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const handleCheckout = () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        router.push('/checkout');
    };

    // Calculate cart statistics
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueProducts = cartItems.filter(item => item.product).length;
    const subtotal = getTotalPrice();
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const finalTotal = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className={`${styles.container} ${styles.empty}`}>
                <div className={styles.empty}>
                    <h2 className={`${styles.emptyTitle} title`}> Cart is Empty</h2>
                    <p>You haven't added any products to your cart yet</p>
                    <button
                        onClick={() => router.push('/products')}
                        className={styles.shopNowBtn}
                    >
                        Shop Now
                    </button>
                </div>
            </div >
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.cartContent}>
                <div className={styles.cartItems}>
                    {cartItems
                        .filter(item => item.product)
                        .map(item => (
                            <CartItem
                                key={item.product!.id}
                                item={item}
                            />
                        ))
                    }
                </div>

                <div className={styles.cartSummary}>
                    <h3 className={`${styles.summaryTitle} title`}>Order Summary</h3>

                    {/* Cart Statistics */}
                    <div className={styles.cartStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Items in Cart:</span>
                            <span className={styles.statValue}>{totalItems}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Unique Products:</span>
                            <span className={styles.statValue}>{uniqueProducts}</span>
                        </div>
                    </div>

                    <div className={styles.summaryRows}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Shipping:</span>
                            <span className={shipping === 0 ? styles.free : ''}>
                                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                            </span>
                        </div>

                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total:</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className={styles.deliveryInfo}>
                        <div className={styles.deliveryRow}>
                            <span>📦 Estimated Delivery:</span>
                        </div>
                        <div className={styles.deliveryDate}>
                            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/products')}
                        className={styles.continueBtn}
                    >
                        Continue Shopping
                    </button>

                    <button
                        onClick={handleCheckout}
                        className={styles.checkoutBtn}
                    >
                        {user ? 'Proceed to Checkout' : 'Login to Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}