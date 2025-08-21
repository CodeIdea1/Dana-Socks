'use client';

// app/cart/page.tsx
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
                    <h2>السلة فارغة</h2>
                    <p>لم تقم بإضافة أي منتجات إلى السلة بعد</p>
                    <button
                        onClick={() => router.push('/products')}
                        className={styles.shopNowBtn}
                    >
                        تسوق الآن
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>سلة التسوق</h1>
                <p className={styles.itemCount}>{cartItems.length} منتج في السلة</p>
            </div>

            <div className={styles.cartContent}>
                <div className={styles.cartItems}>
                    {cartItems
                        .filter(item => item.product) // Filter out items without product
                        .map(item => (
                            <CartItem
                                key={item.product!.id}
                                item={item}
                            />
                        ))
                    }
                </div>

                <div className={styles.cartSummary}>
                    <h3 className={styles.summaryTitle}>ملخص الطلب</h3>

                    <div className={styles.summaryRow}>
                        <span>المجموع الفرعي:</span>
                        <span>{getTotalPrice()} ج.م</span>
                    </div>

                    <div className={styles.summaryRow}>
                        <span>الشحن:</span>
                        <span>مجاني</span>
                    </div>

                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>المجموع الإجمالي:</span>
                        <span>{getTotalPrice()} ج.م</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className={styles.checkoutBtn}
                    >
                        {user ? 'إتمام الطلب' : 'تسجيل الدخول للطلب'}
                    </button>

                    <button
                        onClick={() => router.push('/products')}
                        className={styles.continueBtn}
                    >
                        متابعة التسوق
                    </button>
                </div>
            </div>
        </div>
    );
}