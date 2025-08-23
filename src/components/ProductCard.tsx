'use client';
// components/ProductCard.tsx
import { Product, useCart } from '@/contexts/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();

    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    const cartItem = cartItems.find(item => item.product?.id === product.id);

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleAddToWishlist = () => {
        addToWishlist(product);
    };

    // تنظيف وفحص رابط الصورة
    const getImageUrl = (url: string | undefined): string => {
        if (!url || url.trim() === '') {
            return '/placeholder.png';
        }

        // إزالة المسافات الزائدة
        const cleanUrl = url.trim();

        // التحقق من صحة الرابط
        try {
            new URL(cleanUrl);
            return cleanUrl;
        } catch {
            console.warn('Invalid URL:', url);
            return '/placeholder.png';
        }
    };

    const imageUrl = getImageUrl(product.imageUrl);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error('Image failed to load:', imageUrl);
        console.error('Product details:', {
            id: product.id,
            name: product.name,
            originalImageUrl: product.imageUrl
        });

        // استخدام صورة احتياطية
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder.png';

        // إذا فشلت الصورة الاحتياطية أيضاً، إخفاء الصورة
        target.onerror = () => {
            target.style.display = 'none';
            console.error('Fallback image also failed');
        };
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log('✅ Image loaded successfully:', imageUrl);
        const target = e.target as HTMLImageElement;
        target.style.opacity = '1';
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img
                    src={imageUrl}
                    alt={product.name || 'منتج'}
                    className={styles.image}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                    style={{
                        opacity: '0',
                        transition: 'opacity 0.3s ease',
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                    }}
                    // إضافة crossOrigin للتعامل مع الروابط الخارجية
                    crossOrigin="anonymous"
                />
                <button
                    className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                    onClick={handleAddToWishlist}
                    aria-label={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                    ♥
                </button>
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.priceStock}>
                    <span className={styles.price}>{product.price} ج.م</span>
                    <span className={styles.stock}>المتوفر: {product.stock}</span>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.addToCartBtn}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                    {cartItem && (
                        <span className={styles.cartQuantity}>
                            في السلة: {cartItem.quantity}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}