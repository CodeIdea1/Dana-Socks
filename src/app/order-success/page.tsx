'use client';
// app/order-success/page.tsx

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './order-success.module.css';

interface OrderData {
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    customerInfo: {
        fullName: string;
        phone: string;
        city: string;
        address: string;
    };
}

export default function OrderSuccessPage() {
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (!orderId) {
            router.push('/products');
            return;
        }

        fetchOrderData();
    }, [orderId]);

    const fetchOrderData = async () => {
        if (!orderId || !db) return;

        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (orderDoc.exists()) {
                setOrderData(orderDoc.data() as OrderData);
            } else {
                setError('لم يتم العثور على الطلب');
            }
        } catch (err) {
            console.error('خطأ في جلب بيانات الطلب:', err);
            setError('حدث خطأ في جلب بيانات الطلب');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>جاري التحميل...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>عذراً، حدث خطأ</h2>
                    <p>{error}</p>
                    <Link href="/products" className={styles.button}>
                        العودة للمنتجات
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.successCard}>
                    <div className={styles.icon}>✅</div>

                    <h1 className={styles.title}>تم إرسال طلبك بنجاح!</h1>

                    <p className={styles.message}>
                        شكراً لك! لقد تم استلام طلبك وسيتم التواصل معك قريباً لتأكيد التوصيل.
                    </p>

                    {orderData && (
                        <div className={styles.orderDetails}>
                            <h2>تفاصيل الطلب</h2>

                            <div className={styles.detail}>
                                <span className={styles.label}>رقم الطلب:</span>
                                <span className={styles.value}>{orderData.orderNumber}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>المجموع:</span>
                                <span className={styles.value}>{orderData.totalAmount.toFixed(2)} ج.م</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>تاريخ الطلب:</span>
                                <span className={styles.value}>
                                    {new Date(orderData.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>اسم العميل:</span>
                                <span className={styles.value}>{orderData.customerInfo.fullName}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>رقم الهاتف:</span>
                                <span className={styles.value}>{orderData.customerInfo.phone}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>عنوان التوصيل:</span>
                                <span className={styles.value}>
                                    {orderData.customerInfo.address}, {orderData.customerInfo.city}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={styles.nextSteps}>
                        <h3>الخطوات التالية:</h3>
                        <ul>
                            <li>سيتم التواصل معك خلال 24 ساعة لتأكيد الطلب</li>
                            <li>سيتم توصيل طلبك خلال 2-3 أيام عمل</li>
                            <li>الدفع عند الاستلام</li>
                            <li>يمكنك تتبع حالة طلبك من حسابك</li>
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/products" className={styles.button}>
                            متابعة التسوق
                        </Link>

                        <Link href="/profile" className={styles.buttonSecondary}>
                            عرض طلباتي
                        </Link>
                    </div>

                    <div className={styles.contact}>
                        <p>
                            <strong>هل تحتاج مساعدة؟</strong><br />
                            تواصل معنا عبر الواتساب: <a href="https://wa.me/+201000000000">01000000000</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}