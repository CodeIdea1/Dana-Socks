'use client';
import { Product, useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingCart, Eye } from 'lucide-react';
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
            removeFromWishlist(item.id);
            console.log('Product added to cart and removed from wishlist');
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
        return new Intl.NumberFormat('en-US').format(price);
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

                <button
                    onClick={handleRemoveFromWishlist}
                    className={styles.removeWishlistBtn}
                    title="Remove from wishlist"
                >
                    <Trash2 size={20} />
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
                                Only {item.stock} left
                            </span>
                        )}
                        {item.stock === 0 && (
                            <span className={styles.outOfStockBadge}>
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.priceAndActions}>
                    <div className={styles.price}>
                        {formatPrice(item.price)} LE
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={handleAddToCart}
                            className={styles.addToCartBtn}
                            disabled={item.stock === 0}
                            title={item.stock === 0 ? 'Product unavailable' : 'Add to cart'}
                        >
                            <ShoppingCart size={18} />
                            {item.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                        </button>

                        <button
                            onClick={handleViewDetails}
                            className={styles.viewDetailsBtn}
                            title="View details"
                        >
                            <Eye size={18} />
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}