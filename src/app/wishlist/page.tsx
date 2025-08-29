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


                <div className={styles.emptyWishlist}>
                    <h2 className={`${styles.emptyTitle} title`}>Wishlist is empty</h2>
                    <p>You haven't added any products to your wishlist yet</p>
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
                <h1 className={`${styles.title} title`}>Wishlist</h1>
                <p className={styles.subtitle}>
                    You have {wishlistItems.length} items in your wishlist
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
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}