'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import {
    convertFirebaseProductData,
    getProductImages,
    handleImageError as utilsHandleImageError,
    ExtendedProduct
} from '@/utils/firebaseHelpers';
import styles from './ProductDetails.module.css';

interface ProductDetailsClientProps {
    productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
    const [product, setProduct] = useState<ExtendedProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();
    const router = useRouter();

    const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;
    const cartItem = product ? cartItems.find(item => item.product?.id === product.id) : null;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                const productDoc = await getDoc(doc(db, 'products', productId));

                if (!productDoc.exists()) {
                    setError('Product not found');
                    return;
                }

                const productData = convertFirebaseProductData(productDoc.id, productDoc.data());
                setProduct(productData);

            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Error loading product');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
        }
    };

    const handleAddToWishlist = () => {
        if (product) {
            addToWishlist(product);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        utilsHandleImageError(e);
    };

    const handleGoBack = () => {
        router.back();
    };

    const productImages = product ? getProductImages(product) : [];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>⚠️ Error</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className={styles.backButton}
                        aria-label="Go back"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button
                type="button"
                onClick={handleGoBack}
                className={styles.backButton}
                aria-label="Go back"
            >
                ← Back
            </button>

            <div className={styles.productDetails}>
                <div className={styles.imageSection}>
                    <div className={styles.mainImageContainer}>
                        <img
                            src={productImages[selectedImage] || '/placeholder.png'}
                            alt={product.name}
                            className={styles.mainImage}
                            onError={handleImageError}
                        />

                        <button
                            type="button"
                            className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                            onClick={handleAddToWishlist}
                            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            ♥
                        </button>
                    </div>

                    {productImages.length > 1 && (
                        <div className={styles.thumbnails}>
                            {productImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${styles.thumbnail} ${selectedImage === index ? styles.activeThumbnail : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img
                                        src={image || '/placeholder.png'}
                                        alt={`${product.name} - Image ${index + 1}`}
                                        onError={handleImageError}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.detailsSection}>
                    <div className={styles.productInfo}>
                        <h1 className={styles.productName}>{product.name}</h1>

                        <div className={styles.category}>
                            <span>Category: {product.category}</span>
                        </div>

                        <div className={styles.price}>
                            <span className={styles.priceValue}>{product.price} EGP</span>
                        </div>

                        <div className={styles.stock}>
                            <span className={`${styles.stockValue} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                {product.stock > 0 ? `In Stock: ${product.stock} pcs` : 'Out of Stock'}
                            </span>
                        </div>

                        <div className={styles.description}>
                            <h3>Product Description:</h3>
                            <p>{product.description || 'No description available'}</p>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        {product.stock > 0 && (
                            <div className={styles.quantitySelector}>
                                <label htmlFor="quantity">Quantity:</label>
                                <div className={styles.quantityControls}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                        className={styles.quantityInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.addToCartBtn}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                aria-label="Add to cart"
                            >
                                {product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
                            </button>

                            {cartItem && (
                                <div className={styles.cartInfo}>
                                    <span>In Cart: {cartItem.quantity} pcs</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}