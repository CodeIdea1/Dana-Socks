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
    const cartItem = cartItems.find(item => item.product.id === product.id);

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleAddToWishlist = () => {
        addToWishlist(product);
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={styles.image}
                />
                <button
                    className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                    onClick={handleAddToWishlist}
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
                        {product.stock === 0 ? 'نفد المخزون' : 'أضف للسلة'}
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