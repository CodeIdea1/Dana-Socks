'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

// استيراد Swiper وmodules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, FreeMode, Mousewheel } from 'swiper/modules';

// استيراد CSS الخاص بـ Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/free-mode';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // دالة تنظيف رابط الصورة
    const cleanImageUrl = (url: string | undefined): string => {
        if (!url) return '';
        const cleaned = url.toString().trim();
        return cleaned;
    };

    useEffect(() => {
        const fetchFirebaseProducts = async () => {
            try {
                setLoading(true);
                setError('');

                // إنشاء استعلام مع ترتيب (اختياري)
                const productsQuery = query(
                    collection(db, 'products'),
                    orderBy('createdAt', 'desc') // ترتيب بالأحدث أولاً
                );

                const productsSnapshot = await getDocs(productsQuery);

                if (productsSnapshot.empty) {
                    setError('🚫 لا توجد منتجات متاحة في قاعدة البيانات');
                    setProducts([]);
                    return;
                }

                const productsList = productsSnapshot.docs.map(doc => {
                    const data = doc.data();

                    const product = {
                        category: data.category || 'غير مصنف',
                        createdAt: data.createdAt || '',
                        description: data.description || '',
                        id: doc.id,
                        // التعامل مع كل من imageUrl و image القديم
                        imageUrl: cleanImageUrl(data.imageUrl) || cleanImageUrl(data.image) || '',
                        name: data.name || 'غير محدد',
                        price: Number(data.price) || 0,
                        stock: Number(data.stock) || 0,
                    } as Product;

                    // طباعة معلومات المنتج للتشخيص
                    console.log('Product loaded:', {
                        id: product.id,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        hasValidImage: !!product.imageUrl && product.imageUrl.length > 0
                    });

                    return product;
                });

                // فلترة المنتجات المتوفرة فقط (اختياري)
                const availableProducts = productsList.filter(product =>
                    product.stock > 0 && product.price > 0
                );

                setProducts(availableProducts);

                if (availableProducts.length === 0) {
                    setError('📦 لا توجد منتجات متوفرة حالياً');
                }

            } catch (error) {
                console.error('Error fetching products from Firebase:', error);
                setError('⚠️ حدث خطأ أثناء تحميل المنتجات من قاعدة البيانات');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFirebaseProducts();
    }, []);

    // دالة إعادة المحاولة
    const handleRetry = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}>
                        🔄 جاري تحميل المنتجات من قاعدة البيانات...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>منتجاتنا</h1>
                <p className={styles.subtitle}>اختر من تشكيلتنا الواسعة من الشرابات عالية الجودة</p>
                <p className={styles.productCount}>
                    {products.length > 0 && `عدد المنتجات المتوفرة: ${products.length}`}
                </p>
            </div>

            {error && (
                <div className={styles.warning}>
                    <p>{error}</p>
                    <button
                        onClick={handleRetry}
                        className={styles.retryButton}
                    >
                        🔄 إعادة المحاولة
                    </button>
                </div>
            )}

            {products.length > 0 && (
                <div className={styles.swiperContainer}>
                    <Swiper
                        modules={[Navigation, Pagination, Scrollbar, A11y, FreeMode, Mousewheel]}
                        spaceBetween={20}
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
                        scrollbar={{
                            el: `.${styles.swiperScrollbar}`,
                            draggable: true,
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
                                slidesPerView: 2.5,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3.5,
                                spaceBetween: 25,
                            },
                            1200: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        className={styles.productsSwiper}
                    >
                        {products.map(product => (
                            <SwiperSlide key={product.id} className={styles.swiperSlide}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* أزرار التنقل المخصصة */}
                    <div className={styles.swiperButtonPrev}></div>
                    <div className={styles.swiperButtonNext}></div>

                    {/* النقاط التفاعلية */}
                    <div className={styles.swiperPagination}></div>

                    {/* شريط التمرير */}
                    <div className={styles.swiperScrollbar}></div>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className={styles.emptyState}>
                    <h2>🏪 لا توجد منتجات حالياً</h2>
                    <p>سيتم إضافة منتجات جديدة قريباً</p>
                </div>
            )}
        </div>
    );
}