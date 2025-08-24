'use client';
import { Product, useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import styles from './WishlistItem.module.css';

interface WishlistItemProps {
    item: Product;
}

export default function WishlistItem({ item }: WishlistItemProps) {
    const { addToCart, removeFromWishlist } = useCart();
    const router = useRouter();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = addToCart(item);
        if (success) {
            // حذف المنتج من المفضلة تلقائياً بعد إضافته للسلة
            removeFromWishlist(item.id);

            // يمكنك إضافة toast notification هنا
            console.log('تم إضافة المنتج للسلة وإزالته من المفضلة');
        }
    };

    const handleRemoveFromWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromWishlist(item.id);
    };

    const handleViewDetails = () => {
        router.push(`/products/${item.id}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-EG').format(price);
    };

    return (
        <div className={styles.wishlistItem} onClick={handleViewDetails}>
            <div className={styles.productImage}>
                <img
                    src={item.imageUrl || '/placeholder-image.jpg'}
                    alt={item.name}
                    className={styles.image}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                    }}
                />

                {/* زر الحذف من المفضلة */}
                <button
                    onClick={handleRemoveFromWishlist}
                    className={styles.removeWishlistBtn}
                    title="إزالة من المفضلة"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className={styles.productInfo}>
                <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    <p className={styles.productDescription}>{item.description}</p>
                    <div className={styles.productMeta}>
                        <span className={styles.category}>{item.category}</span>
                        {item.stock < 5 && item.stock > 0 && (
                            <span className={styles.lowStockBadge}>
                                متبقي {item.stock}
                            </span>
                        )}
                        {item.stock === 0 && (
                            <span className={styles.outOfStockBadge}>
                                نفد المخزون
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.priceAndActions}>
                    <div className={styles.price}>
                        {formatPrice(item.price)} جنيه
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={handleAddToCart}
                            className={styles.addToCartBtn}
                            disabled={item.stock === 0}
                            title={item.stock === 0 ? 'المنتج غير متوفر' : 'إضافة للسلة'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                            </svg>
                            {item.stock === 0 ? 'غير متوفر' : 'إضافة للسلة'}
                        </button>

                        <button
                            onClick={handleViewDetails}
                            className={styles.viewDetailsBtn}
                            title="عرض التفاصيل"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}