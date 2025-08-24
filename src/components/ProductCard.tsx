import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, cartItems, removeFromCart } = useCart();
    const router = useRouter();

    // التحقق من وجود المنتج في المفضلة
    const isInWishlist = wishlistItems.some(item => item.id === product.id);

    // التحقق من وجود المنتج في السلة
    const isInCart = cartItems.some(item => item.id === product.id);

    const handleCartToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInCart) {
            removeFromCart(product.id);
        } else {
            addToCart(product);
        }
    };

    const handleViewDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // الانتقال إلى صفحة تفاصيل المنتج
        router.push(`/products/${product.id}`);
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-EG').format(price);
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.imageContainer}>
                <img
                    src={product.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                    }}
                />

                {/* أيقونة المفضلة */}
                <button
                    className={`${styles.wishlistButton} ${isInWishlist ? styles.inWishlist : ''}`}
                    onClick={handleWishlistToggle}
                    title={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>

                {/* overlay الذي يظهر عند الهوفر */}
                <div className={styles.hoverOverlay}>
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.detailsButton}
                            onClick={handleViewDetails}
                            title="عرض التفاصيل"
                        >
                            <span className={styles.buttonIcon}>👁️</span>
                            انقر لعرض التفاصيل
                        </button>

                        <button
                            className={`${styles.addToCartButton} ${isInCart ? styles.inCart : ''}`}
                            onClick={handleCartToggle}
                            title={isInCart ? 'إزالة من السلة' : 'إضافة للسلة'}
                        >
                            <span className={styles.buttonIcon}>
                                {isInCart ? '✓' : '🛒'}
                            </span>
                            {isInCart ? 'في السلة' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>

                {/* إشارة المخزون */}
                {product.stock < 5 && product.stock > 0 && (
                    <div className={styles.lowStockBadge}>
                        متبقي {product.stock}
                    </div>
                )}

                {product.stock === 0 && (
                    <div className={styles.outOfStockBadge}>
                        نفد المخزون
                    </div>
                )}
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>

                <div className={styles.priceContainer}>
                    <span className={styles.price}>{formatPrice(product.price)} جنيه</span>
                    <span className={styles.category}>{product.category}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;