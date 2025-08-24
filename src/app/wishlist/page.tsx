'use client';
import { useCart } from '@/contexts/CartContext';
import WishlistItem from '@/components/WishlistItem';
import { useRouter } from 'next/navigation';
import styles from './wishlist.module.css';

export default function WishlistPage() {
    const { wishlistItems } = useCart();
    const router = useRouter();

    if (wishlistItems.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>قائمة المفضلة</h1>
                </div>

                <div className={styles.emptyWishlist}>
                    <div className={styles.emptyIcon}>♡</div>
                    <h2>قائمة المفضلة فارغة</h2>
                    <p>لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
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
                <h1 className={styles.title}>قائمة المفضلة</h1>
                <p className={styles.subtitle}>
                    لديك {wishlistItems.length} منتج في المفضلة
                </p>
            </div>

            <div className={styles.wishlistItems}>
                {wishlistItems.map((item) => (
                    <WishlistItem key={item.id} item={item} />
                ))}
            </div>

            <div className={styles.actions}>
                <button
                    onClick={() => router.push('/products')}
                    className={styles.continueShoppingBtn}
                >
                    متابعة التسوق
                </button>
            </div>
        </div>
    );
}