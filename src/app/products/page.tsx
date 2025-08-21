'use client';
// app/products/page.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
                const productsCollection = collection(db, 'products');
                const productsSnapshot = await getDocs(productsCollection);

                if (productsSnapshot.docs.length > 0) {
                    const productsList = productsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Product));

                    setProducts(productsList);
                    setError('');
                } else {
                    setError('🚫 لا توجد منتجات متاحة في قاعدة البيانات');
                }
            } catch (error) {
                console.error('Error fetching products from Firebase:', error);
                setError('⚠️ حدث خطأ أثناء تحميل المنتجات');
            } finally {
                setLoading(false);
            }
        };

        fetchFirebaseProducts();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>منتجاتنا</h1>
                <p className={styles.subtitle}>اختر من تشكيلتنا الواسعة من الشرابات عالية الجودة</p>
            </div>

            {error && (
                <div className={styles.warning}>
                    {error}
                </div>
            )}

            <div className={styles.productsGrid}>
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}>
                        🔄 جاري تحميل المنتجات...
                    </div>
                </div>
            )}
        </div>
    );
}
