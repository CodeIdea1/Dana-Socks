'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                    return {
                        category: data.category || 'غير مصنف',
                        createdAt: data.createdAt || '',
                        description: data.description || '',
                        id: doc.id,
                        imageUrl: data.imageUrl || '/https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUiouPTRrsa1YqBlA6IatM4nBydTclYYVF2w&s',
                        name: data.name || 'غير محدد',
                        price: Number(data.price) || 0,
                        stock: Number(data.stock) || 0,
                    } as Product;
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
                <div className={styles.productsGrid}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
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