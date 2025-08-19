'use client';
// app/products/page.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

// المنتجات التجريبية - يتم عرضها مباشرة للتحميل السريع
const demoProducts: Product[] = [
    {
        id: '1',
        name: 'شرابات قطنية كلاسيكية',
        description: 'شرابات مريحة مصنوعة من القطن الخالص، مثالية للاستخدام اليومي',
        price: 50,
        imageUrl: 'https://via.placeholder.com/300x200/667eea/ffffff?text=%D8%B4%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA+%D9%82%D8%B7%D9%86%D9%8A%D8%A9',
        stock: 25,
        category: 'قطنية'
    },
    {
        id: '2',
        name: 'شرابات رياضية متقدمة',
        description: 'شرابات مخصصة للأنشطة الرياضية مع تقنية امتصاص الرطوبة',
        price: 75,
        imageUrl: 'https://via.placeholder.com/300x200/28a745/ffffff?text=%D8%B4%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA+%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9',
        stock: 15,
        category: 'رياضية'
    },
    {
        id: '3',
        name: 'شرابات صوفية شتوية',
        description: 'شرابات دافئة من الصوف الطبيعي للأيام الباردة',
        price: 100,
        imageUrl: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=%D8%B4%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA+%D8%B5%D9%88%D9%81%D9%8A%D8%A9',
        stock: 10,
        category: 'صوفية'
    },
    {
        id: '4',
        name: 'شرابات حريرية أنيقة',
        description: 'شرابات فاخرة من الحرير الطبيعي للمناسبات الخاصة',
        price: 120,
        imageUrl: 'https://via.placeholder.com/300x200/6f42c1/ffffff?text=%D8%B4%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA+%D8%AD%D8%B1%D9%8A%D8%B1%D9%8A%D8%A9',
        stock: 8,
        category: 'حريرية'
    },
    {
        id: '5',
        name: 'شرابات مضادة للبكتيريا',
        description: 'شرابات بتقنية مضادة للبكتيريا والروائح',
        price: 85,
        imageUrl: 'https://via.placeholder.com/300x200/20c997/ffffff?text=%D9%85%D8%B6%D8%A7%D8%AF%D8%A9+%D9%84%D9%84%D8%A8%D9%83%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7',
        stock: 20,
        category: 'طبية'
    },
    {
        id: '6',
        name: 'شرابات ملونة للأطفال',
        description: 'مجموعة شرابات ملونة ومرحة للأطفال',
        price: 35,
        imageUrl: 'https://via.placeholder.com/300x200/fd7e14/ffffff?text=%D8%B4%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA+%D8%A7%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84',
        stock: 30,
        category: 'أطفال'
    }
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>(demoProducts); // البدء بالمنتجات التجريبية
    const [loading, setLoading] = useState(false); // لا نريد loading في البداية
    const [error, setError] = useState('');
    const [dataSource, setDataSource] = useState<'demo' | 'firebase'>('demo');

    useEffect(() => {
        // محاولة تحميل المنتجات من Firebase في الخلفية
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
                    setDataSource('firebase');
                    setError(''); // مسح أي خطأ سابق
                }
            } catch (error) {
                console.error('Error fetching products from Firebase:', error);
                setError('تم تحميل المنتجات التجريبية (Firebase غير متاح حالياً)');
                // الاحتفاظ بالمنتجات التجريبية
            } finally {
                setLoading(false);
            }
        };

        // تأخير استدعاء Firebase لمدة ثانية واحدة لعرض المنتجات التجريبية أولاً
        const timeoutId = setTimeout(fetchFirebaseProducts, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>منتجاتنا</h1>
                <p className={styles.subtitle}>اختر من تشكيلتنا الواسعة من الشرابات عالية الجودة</p>

                {/* مؤشر مصدر البيانات */}
                <div className={styles.dataSource}>
                    {dataSource === 'demo' ? (
                        <span className={styles.demoIndicator}>
                            📦 منتجات تجريبية {loading && '(جاري البحث عن تحديثات...)'}
                        </span>
                    ) : (
                        <span className={styles.firebaseIndicator}>
                            🔥 محملة من Firebase
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className={styles.warning}>
                    ⚠️ {error}
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
                        🔄 جاري البحث عن تحديثات من الخادم...
                    </div>
                </div>
            )}
        </div>
    );
}