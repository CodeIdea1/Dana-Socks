'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, FreeMode, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cleanImageUrl = useCallback((url: string | undefined): string => {
        if (!url) return '';
        return url.toString().trim();
    }, []);

    const availableProducts = useMemo(() => {
        return products.filter(product =>
            product.stock > 0 && product.price > 0
        );
    }, [products]);

    const fetchFirebaseProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const productsQuery = query(
                collection(db, 'products'),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const productsSnapshot = await getDocs(productsQuery);

            if (productsSnapshot.empty) {
                setError('No products available in database');
                setProducts([]);
                return;
            }

            const productsList = productsSnapshot.docs.map(doc => {
                const data = doc.data();

                return {
                    category: data.category || 'Uncategorized',
                    createdAt: data.createdAt || '',
                    description: data.description || '',
                    id: doc.id,
                    imageUrl: cleanImageUrl(data.imageUrl) || cleanImageUrl(data.image) || '',
                    name: data.name || 'Unknown',
                    price: Number(data.price) || 0,
                    stock: Number(data.stock) || 0,
                } as Product;
            });

            setProducts(productsList);

        } catch (error) {
            console.error('Error fetching products from Firebase:', error);
            setError('Error loading products from database');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [cleanImageUrl]);

    useEffect(() => {
        fetchFirebaseProducts();
    }, [fetchFirebaseProducts]);

    const handleRetry = useCallback(() => {
        fetchFirebaseProducts();
    }, [fetchFirebaseProducts]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}>
                        Loading products...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} id='products'>
            {error && (
                <div className={styles.warning}>
                    <p>{error}</p>
                    <button
                        onClick={handleRetry}
                        className={styles.retryButton}
                    >
                        Retry
                    </button>
                </div>
            )}

            {availableProducts.length > 0 && (
                <div className={styles.swiperContainer}>
                    <Swiper
                        modules={[Navigation, Pagination, A11y, FreeMode, Mousewheel]}
                        spaceBetween={10}
                        slidesPerView="auto"
                        freeMode={true}
                        mousewheel={{
                            forceToAxis: true,
                            sensitivity: 0.5,
                        }}
                        grabCursor={true}
                        navigation={{
                            nextEl: `.${styles.swiperButtonNext}`,
                            prevEl: `.${styles.swiperButtonPrev}`,
                        }}
                        pagination={{
                            el: `.${styles.swiperPagination}`,
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 10,
                            },
                            480: {
                                slidesPerView: 1.5,
                                spaceBetween: 15,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 2.5,
                                spaceBetween: 25,
                            },
                            1200: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        className={styles.productsSwiper}
                    >
                        {availableProducts.map(product => (
                            <SwiperSlide key={product.id} className={styles.swiperSlide}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className={styles.swiperButtonNext}>
                        <ChevronRight size={20} />
                    </div>
                    <div className={styles.swiperButtonPrev}>
                        <ChevronLeft size={20} />
                    </div>
                </div>
            )}

            {!loading && !error && availableProducts.length === 0 && (
                <div className={styles.emptyState}>
                    <h2>No products available</h2>
                    <p>New products will be added soon</p>
                </div>
            )}
        </div>
    );
}