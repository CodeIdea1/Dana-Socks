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

    if (cartItems.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <h2>Cart is Empty</h2>
                    <p>You haven't added any products to your cart yet</p>
                    <button
                        onClick={() => router.push('/products')}
                        className={styles.shopNowBtn}
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Shopping Cart</h1>
                <p className={styles.itemCount}>{cartItems.length} items in cart</p>
            </div>

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
                    <h3 className={styles.summaryTitle}>Order Summary</h3>

                    <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>${getTotalPrice()}</span>
                    </div>

                    <div className={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>

                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total:</span>
                        <span>${getTotalPrice()}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className={styles.checkoutBtn}
                    >
                        {user ? 'Proceed to Checkout' : 'Login to Order'}
                    </button>

                    <button
                        onClick={() => router.push('/products')}
                        className={styles.continueBtn}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}