'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, useCart } from '@/contexts/CartContext';
import styles from './ProductDetails.module.css';

interface ProductDetailsClientProps {
    productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const { addToCart, addToWishlist, wishlistItems, cartItems } = useCart();
    const router = useRouter();

    // تحديد ما إذا كان المنتج في المفضلة أم لا
    const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;
    const cartItem = product ? cartItems.find(item => item.product?.id === product.id) : null;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                const productDoc = await getDoc(doc(db, 'products', productId));

                if (!productDoc.exists()) {
                    setError('المنتج غير موجود');
                    return;
                }

                const data = productDoc.data();
                const productData = {
                    id: productDoc.id,
                    name: data.name || 'غير محدد',
                    description: data.description || '',
                    price: Number(data.price) || 0,
                    stock: Number(data.stock) || 0,
                    category: data.category || 'غير مصنف',
                    imageUrl: data.imageUrl || data.image || '',
                    // صور إضافية (إذا كانت متوفرة)
                    additionalImages: data.additionalImages || [],
                    createdAt: data.createdAt || ''
                } as Product & { additionalImages?: string[] };

                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('حدث خطأ أثناء تحميل المنتج');
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
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder.png';
    };

    const handleGoBack = () => {
        router.back();
    };

    // دالة للحصول على الصور
    const getProductImages = () => {
        if (!product) return [];

        const images = [product.imageUrl];

        // إضافة الصور الإضافية إذا كانت متوفرة
        if ('additionalImages' in product && product.additionalImages) {
            images.push(...product.additionalImages);
        } else {
            // إضافة صور افتراضية إضافية للعرض
            images.push(product.imageUrl, product.imageUrl);
        }

        return images.filter(img => img && img.trim() !== '');
    };

    const productImages = getProductImages();

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل تفاصيل المنتج...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>⚠️ خطأ</h2>
                    <p>{error}</p>
                    <button onClick={handleGoBack} className={styles.backButton}>
                        العودة للخلف
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* زر العودة */}
            <button onClick={handleGoBack} className={styles.backButton}>
                ← العودة
            </button>

            <div className={styles.productDetails}>
                {/* قسم الصور */}
                <div className={styles.imageSection}>
                    {/* الصورة الرئيسية */}
                    <div className={styles.mainImageContainer}>
                        <img
                            src={productImages[selectedImage] || '/placeholder.png'}
                            alt={product.name}
                            className={styles.mainImage}
                            onError={handleImageError}
                        />

                        {/* زر المفضلة على الصورة */}
                        <button
                            className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                            onClick={handleAddToWishlist}
                            aria-label={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                        >
                            ♥
                        </button>
                    </div>

                    {/* الصور المصغرة */}
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
                                        alt={`${product.name} - صورة ${index + 1}`}
                                        onError={handleImageError}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* قسم التفاصيل */}
                <div className={styles.detailsSection}>
                    <div className={styles.productInfo}>
                        <h1 className={styles.productName}>{product.name}</h1>

                        <div className={styles.category}>
                            <span>التصنيف: {product.category}</span>
                        </div>

                        <div className={styles.price}>
                            <span className={styles.priceValue}>{product.price} ج.م</span>
                        </div>

                        <div className={styles.stock}>
                            <span className={`${styles.stockValue} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                {product.stock > 0 ? `متوفر: ${product.stock} قطعة` : 'غير متوفر'}
                            </span>
                        </div>

                        <div className={styles.description}>
                            <h3>وصف المنتج:</h3>
                            <p>{product.description || 'لا يوجد وصف متاح'}</p>
                        </div>
                    </div>

                    {/* أدوات التحكم */}
                    <div className={styles.controls}>
                        {product.stock > 0 && (
                            <div className={styles.quantitySelector}>
                                <label htmlFor="quantity">الكمية:</label>
                                <div className={styles.quantityControls}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
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
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                className={styles.addToCartBtn}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'غير متوفر' : `إضافة ${quantity} إلى السلة`}
                            </button>

                            {cartItem && (
                                <div className={styles.cartInfo}>
                                    <span>في السلة: {cartItem.quantity} قطعة</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}