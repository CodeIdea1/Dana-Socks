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
    const [cartValidation, setCartValidation] = useState<{ valid: boolean, errors: string[] }>({
        valid: false,
        errors: []
    });
    const [orderData, setOrderData] = useState<OrderData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    // التحقق من صحة عناصر السلة
    const validateCartItems = () => {
        const errors: string[] = [];
        let isValid = true;

        console.log('Validating cart items:', cartItems);

        if (!cartItems || cartItems.length === 0) {
            errors.push('السلة فارغة');
            isValid = false;
        } else {
            cartItems.forEach((item, index) => {
                // التحقق من الـ ID
                if (!item.id || item.id === '') {
                    errors.push(`المنتج رقم ${index + 1}: ID غير متوفر`);
                    isValid = false;
                }

                // التحقق من الاسم
                if (!item.name || item.name === '' || item.name === 'اسم المنتج غير متوفر') {
                    errors.push(`المنتج رقم ${index + 1}: اسم المنتج غير متوفر`);
                    isValid = false;
                }

                // التحقق من السعر
                if (!item.price || typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
                    errors.push(`المنتج ${item.name || 'غير معروف'}: السعر غير صحيح (${item.price})`);
                    isValid = false;
                }

                // التحقق من الكمية
                if (!item.quantity || typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
                    errors.push(`المنتج ${item.name || 'غير معروف'}: الكمية غير صحيحة (${item.quantity})`);
                    isValid = false;
                }
            });
        }

        // التحقق من المجموع الكلي
        const totalPrice = getTotalPrice();
        if (!totalPrice || typeof totalPrice !== 'number' || isNaN(totalPrice) || totalPrice <= 0) {
            errors.push(`المجموع الكلي غير صحيح: ${totalPrice}`);
            isValid = false;
        }

        setCartValidation({ valid: isValid, errors });
        return isValid;
    };

    // تحديث البريد الإلكتروني عند تغيير المستخدم
    useEffect(() => {
        if (user?.email && !orderData.email) {
            setOrderData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user, orderData.email]);

    // التحقق من صحة السلة عند التحميل
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            validateCartItems();
        }
    }, [cartItems]);

    // إعادة جلب بيانات المنتج من Firebase
    const refreshProductData = async (productId: string) => {
        try {
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                return productDoc.data();
            }
            return null;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
        }
    };

    // فحص المخزون قبل إتمام الطلب مع تحديث البيانات
    const checkAndRefreshStock = async () => {
        const refreshedItems = [];

        for (const item of cartItems) {
            // إعادة جلب بيانات المنتج الحالية
            const productData = await refreshProductData(item.id);

            if (!productData) {
                throw new Error(`المنتج ${item.name || item.id} غير موجود في قاعدة البيانات`);
            }

            // التأكد من صحة البيانات
            const refreshedItem = {
                ...item,
                name: productData.name || item.name || 'منتج غير معروف',
                price: productData.price || item.price || 0,
                imageUrl: productData.imageUrl || item.imageUrl || '',
                stock: productData.stock || 0
            };

            // فحص المخزون
            if (refreshedItem.stock < refreshedItem.quantity) {
                throw new Error(`المخزون غير كافي للمنتج ${refreshedItem.name}. متوفر: ${refreshedItem.stock}, مطلوب: ${refreshedItem.quantity}`);
            }

            refreshedItems.push(refreshedItem);
        }

        return refreshedItems;
    };

    // تحديث المخزون بعد الطلب
    const updateStock = async (items: any[]) => {
        for (const item of items) {
            try {
                const productRef = doc(db, 'products', item.id);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    const currentStock = productDoc.data()?.stock || 0;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    await updateDoc(productRef, {
                        stock: newStock,
                        updatedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error(`Error updating stock for product ${item.id}:`, error);
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

        // التحقق من صحة السلة أولاً
        if (!validateCartItems()) {
            alert('توجد مشاكل في السلة:\n' + cartValidation.errors.join('\n'));
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

            // 1. فحص وتحديث بيانات المنتجات والمخزون
            const refreshedItems = await checkAndRefreshStock();

            // 2. إنشاء الطلب مع البيانات المحدثة
            const orderItems = refreshedItems.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
                imageUrl: item.imageUrl || '',
            }));

            // حساب المجموع الجديد
            const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);

            const orderPayload = {
                userId: user.uid,
                userEmail: user.email || '',
                customerInfo: {
                    fullName: orderData.fullName.trim(),
                    email: orderData.email.trim(),
                    phone: orderData.phone.trim(),
                    address: orderData.address.trim(),
                    city: orderData.city.trim(),
                    notes: orderData.notes.trim()
                },
                items: orderItems,
                totalAmount: totalAmount,
                status: 'pending',
                orderDate: new Date().toISOString(),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            };

            console.log('Final order payload:', orderPayload);

            // 3. حفظ الطلب في Firebase
            const docRef = await addDoc(collection(db, 'orders'), orderPayload);

            // 4. تحديث الطلب برقم الطلب
            await updateDoc(doc(db, 'orders', docRef.id), {
                orderNumber: docRef.id
            });

            // 5. تحديث المخزون
            await updateStock(refreshedItems);

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

            {/* تنبيه المشاكل في السلة */}
            {!cartValidation.valid && (
                <div className={styles.errorContainer} style={{
                    backgroundColor: '#fee',
                    border: '1px solid #f00',
                    padding: '15px',
                    margin: '20px 0',
                    borderRadius: '5px'
                }}>
                    <h3 style={{ color: '#d00' }}>⚠️ توجد مشاكل في السلة:</h3>
                    <ul>
                        {cartValidation.errors.map((error, index) => (
                            <li key={index} style={{ color: '#d00' }}>{error}</li>
                        ))}
                    </ul>
                    <button
                        onClick={() => router.push('/cart')}
                        style={{
                            backgroundColor: '#f00',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        العودة للسلة وإصلاح المشاكل
                    </button>
                </div>
            )}

            {/* تحذير المخزون */}
            <div className={styles.stockWarning}>
                <h3 className={styles.warningTitle}>📦 ملاحظة مهمة:</h3>
                <ul className={styles.warningList}>
                    <li>سيتم التحقق من بيانات المنتجات والمخزون قبل التأكيد</li>
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
                        <span>
                            {item.name || 'اسم غير متوفر'} × {item.quantity || 0}
                            {(!item.name || item.name === 'اسم المنتج غير متوفر') &&
                                <span style={{ color: 'red' }}> (⚠️ بيانات ناقصة)</span>
                            }
                        </span>
                        <span>
                            {(item.price && item.quantity && !isNaN(item.price * item.quantity))
                                ? (item.price * item.quantity).toFixed(2)
                                : '0.00'
                            } ج.م
                        </span>
                    </div>
                ))}
                <hr className={styles.divider} />
                <div className={styles.totalRow}>
                    <span>الإجمالي:</span>
                    <span>
                        {(getTotalPrice() && !isNaN(getTotalPrice()))
                            ? getTotalPrice().toFixed(2)
                            : '0.00'
                        } ج.م
                    </span>
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
                    disabled={loading || !cartValidation.valid}
                    className={`${styles.submitBtn} ${(loading || !cartValidation.valid) ? styles.submitBtnDisabled : ''}`}
                >
                    {loading
                        ? 'جاري التحقق من البيانات وإرسال الطلب...'
                        : cartValidation.valid
                            ? `تأكيد الطلب (${(getTotalPrice() && !isNaN(getTotalPrice())) ? getTotalPrice().toFixed(2) : '0.00'} ج.م)`
                            : 'يرجى إصلاح مشاكل السلة أولاً'
                    }
                </button>
            </form>
        </div>
    );
}