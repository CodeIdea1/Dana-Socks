// app/checkout/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './checkout.module.css';

interface OrderData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
}

export default function CheckoutPage() {
    const { cartItems, clearCart, getTotalPrice } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<OrderData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    // تحديث البريد الإلكتروني عند تغيير المستخدم
    useEffect(() => {
        if (user?.email && !orderData.email) {
            setOrderData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user, orderData.email]);

    // فحص المخزون قبل إتمام الطلب
    const checkStock = async () => {
        for (const item of cartItems) {
            const productId = item.id;
            const productName = item.name;
            const quantity = item.quantity;

            try {
                const productDoc = await getDoc(doc(db, 'products', productId));

                if (!productDoc.exists()) {
                    throw new Error(`المنتج ${productName} غير موجود`);
                }

                const productData = productDoc.data();
                const availableStock = productData.stock || 0;

                if (availableStock < quantity) {
                    throw new Error(`المخزون غير كافي للمنتج ${productName}. متوفر: ${availableStock}, مطلوب: ${quantity}`);
                }
            } catch (error) {
                console.error(`Error checking stock for ${productName}:`, error);
                throw error;
            }
        }
    };

    // تحديث المخزون بعد الطلب
    const updateStock = async () => {
        for (const item of cartItems) {
            const productId = item.id;
            const quantity = item.quantity;

            try {
                const productRef = doc(db, 'products', productId);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    const currentStock = productDoc.data()?.stock || 0;
                    const newStock = Math.max(0, currentStock - quantity);

                    await updateDoc(productRef, {
                        stock: newStock,
                        updatedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error(`Error updating stock for product ${productId}:`, error);
                throw error;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('يجب تسجيل الدخول أولاً');
            router.push('/auth/login');
            return;
        }

        if (cartItems.length === 0) {
            alert('السلة فارغة');
            return;
        }

        // التحقق من صحة البيانات
        if (!orderData.fullName.trim() || !orderData.phone.trim() ||
            !orderData.address.trim() || !orderData.city.trim() || !orderData.email.trim()) {
            alert('يرجى تعبئة جميع الحقول المطلوبة');
            return;
        }

        try {
            setLoading(true);

            // 1. فحص المخزون أولاً
            await checkStock();

            // 2. إنشاء الطلب
            const order = {
                userId: user.uid,
                userEmail: user.email,
                customerInfo: orderData,
                items: cartItems.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity,
                    imageUrl: item.imageUrl || '',
                })),
                totalAmount: getTotalPrice(),
                status: 'pending',
                orderDate: new Date().toISOString(),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            };

            // 3. حفظ الطلب في Firebase
            const docRef = await addDoc(collection(db, 'orders'), order);

            // 4. تحديث الطلب برقم الطلب
            await updateDoc(doc(db, 'orders', docRef.id), {
                orderNumber: docRef.id
            });

            // 5. تحديث المخزون
            await updateStock();

            // 6. تفريغ السلة
            clearCart();

            // 7. الانتقال لصفحة نجاح الطلب
            router.push(`/order-success?orderId=${docRef.id}`);

        } catch (error: any) {
            console.error('Error creating order:', error);
            alert(`خطأ في إرسال الطلب: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // عرض التحميل أثناء فحص حالة المصادقة
    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <h2>جاري التحميل...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.authContainer}>
                <h1>يجب تسجيل الدخول للمتابعة</h1>
                <button
                    onClick={() => router.push('/auth/login')}
                    className={styles.loginBtn}
                >
                    تسجيل الدخول
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h1>السلة فارغة</h1>
                <button
                    onClick={() => router.push('/products')}
                    className={styles.shopBtn}
                >
                    تسوق الآن
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>إتمام الطلب</h1>

            {/* تحذير المخزون */}
            <div className={styles.stockWarning}>
                <h3 className={styles.warningTitle}>📦 ملاحظة مهمة:</h3>
                <ul className={styles.warningList}>
                    <li>سيتم خصم الكميات من المخزون فور تأكيد الطلب</li>
                    <li>في حالة عدم توفر الكمية المطلوبة، سيتم إلغاء الطلب</li>
                    <li>سيتم تحضير الطلب وشحنه خلال 3-7 أيام عمل</li>
                </ul>
            </div>

            {/* ملخص الطلب */}
            <div className={styles.orderSummary}>
                <h2 className={styles.summaryTitle}>ملخص الطلب</h2>
                {cartItems.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ج.م</span>
                    </div>
                ))}
                <hr className={styles.divider} />
                <div className={styles.totalRow}>
                    <span>الإجمالي:</span>
                    <span>{getTotalPrice().toFixed(2)} ج.م</span>
                </div>
            </div>

            {/* نموذج بيانات العميل */}
            <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                <h2 className={styles.formTitle}>بيانات التوصيل</h2>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName" className={styles.formLabel}>
                            الاسم الكامل *
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={orderData.fullName}
                            onChange={(e) => setOrderData({ ...orderData, fullName: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="أدخل اسمك الكامل"
                            title="الاسم الكامل مطلوب"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            البريد الإلكتروني *
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={orderData.email}
                            onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="example@email.com"
                            title="البريد الإلكتروني مطلوب"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.formLabel}>
                            رقم الهاتف *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={orderData.phone}
                            onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="01xxxxxxxxx"
                            title="رقم الهاتف مطلوب"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="address" className={styles.formLabel}>
                            العنوان *
                        </label>
                        <textarea
                            id="address"
                            value={orderData.address}
                            onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                            required
                            className={styles.formTextarea}
                            placeholder="أدخل عنوانك بالتفصيل"
                            title="العنوان مطلوب"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="city" className={styles.formLabel}>
                            المدينة *
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={orderData.city}
                            onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="أدخل اسم المدينة"
                            title="المدينة مطلوبة"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.formLabel}>
                            ملاحظات إضافية
                        </label>
                        <textarea
                            id="notes"
                            value={orderData.notes}
                            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                            placeholder="أي ملاحظات خاصة بالطلب..."
                            className={styles.formTextarea}
                            title="ملاحظات إضافية (اختيارية)"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ''}`}
                >
                    {loading
                        ? 'جاري فحص المخزون وإرسال الطلب...'
                        : `تأكيد الطلب (${getTotalPrice().toFixed(2)} ج.م)`
                    }
                </button>
            </form>
        </div>
    );
}