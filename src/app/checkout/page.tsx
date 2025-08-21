// app/checkout/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    // التحقق من صحة عناصر السلة مع تفاصيل أكثر
    const validateCartItems = () => {
        const errors: string[] = [];
        let isValid = true;

        console.log('🔍 فحص عناصر السلة:', cartItems);

        if (!cartItems || cartItems.length === 0) {
            errors.push('❌ السلة فارغة - يرجى إضافة منتجات أولاً');
            isValid = false;
            setCartValidation({ valid: isValid, errors });
            return isValid;
        }

        cartItems.forEach((item, index) => {
            const itemNumber = index + 1;

            // التحقق من وجود ID صحيح
            if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
                errors.push(`🔴 المنتج رقم ${itemNumber}: معرف المنتج غير صحيح`);
                isValid = false;
            }

            // التحقق من اسم المنتج
            if (!item.name || typeof item.name !== 'string' ||
                item.name.trim() === '' ||
                item.name === 'اسم المنتج غير متوفر' ||
                item.name === 'غير محدد') {
                errors.push(`🏷️ المنتج رقم ${itemNumber}: اسم المنتج مفقود أو غير صحيح`);
                isValid = false;
            }

            // التحقق من السعر
            if (!item.price ||
                typeof item.price !== 'number' ||
                isNaN(item.price) ||
                item.price <= 0) {
                errors.push(`💰 المنتج "${item.name || 'غير معروف'}": السعر غير صحيح (${item.price})`);
                isValid = false;
            }

            // التحقق من الكمية
            if (!item.quantity ||
                typeof item.quantity !== 'number' ||
                isNaN(item.quantity) ||
                item.quantity <= 0 ||
                !Number.isInteger(item.quantity)) {
                errors.push(`📦 المنتج "${item.name || 'غير معروف'}": الكمية غير صحيحة (${item.quantity})`);
                isValid = false;
            }

            // التحقق من وجود رابط الصورة (تحذير فقط)
            if (!item.imageUrl || item.imageUrl.trim() === '') {
                console.warn(`⚠️ المنتج "${item.name}": لا يحتوي على صورة`);
            }
        });

        // التحقق من المجموع الكلي
        const totalPrice = getTotalPrice();
        if (!totalPrice ||
            typeof totalPrice !== 'number' ||
            isNaN(totalPrice) ||
            totalPrice <= 0) {
            errors.push(`💸 المجموع الكلي غير صحيح: ${totalPrice} ج.م`);
            isValid = false;
        }

        console.log(isValid ? '✅ السلة صحيحة' : '❌ السلة تحتوي على أخطاء:', errors);
        setCartValidation({ valid: isValid, errors });
        return isValid;
    };

    // تحديث البريد الإلكتروني عند تغيير المستخدم
    useEffect(() => {
        if (user?.email && orderData.email !== user.email) {
            setOrderData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user?.email]);

    // التحقق من صحة السلة عند التحميل أو تغيير المحتوى
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            validateCartItems();
        }
    }, [cartItems, getTotalPrice]);

    // إعادة جلب بيانات المنتج من Firebase مع معالجة أفضل للأخطاء
    const refreshProductData = async (productId: string) => {
        try {
            console.log(`🔄 جلب بيانات المنتج: ${productId}`);
            const productDoc = await getDoc(doc(db, 'products', productId));

            if (productDoc.exists()) {
                const data = productDoc.data();
                console.log(`✅ تم جلب بيانات المنتج بنجاح:`, data);
                return data;
            } else {
                console.error(`❌ المنتج غير موجود: ${productId}`);
                return null;
            }
        } catch (error) {
            console.error(`💥 خطأ في جلب بيانات المنتج ${productId}:`, error);
            return null;
        }
    };

    // فحص المخزون قبل إتمام الطلب مع تحديث شامل للبيانات
    const checkAndRefreshStock = async () => {
        console.log('🔍 بدء فحص المخزون وتحديث البيانات...');
        const refreshedItems = [];

        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            console.log(`📝 معالجة المنتج ${i + 1}/${cartItems.length}: ${item.name}`);

            // إعادة جلب بيانات المنتج الحالية من Firebase
            const productData = await refreshProductData(item.id);

            if (!productData) {
                throw new Error(`المنتج "${item.name || item.id}" لم يعد موجوداً في قاعدة البيانات`);
            }

            // دمج البيانات الحديثة مع بيانات السلة
            const refreshedItem = {
                id: item.id,
                name: productData.name || item.name || 'منتج غير معروف',
                price: typeof productData.price === 'number' ? productData.price : (item.price || 0),
                imageUrl: productData.imageUrl || item.imageUrl || '',
                stock: typeof productData.stock === 'number' ? productData.stock : 0,
                quantity: item.quantity,
                category: productData.category || item.category || 'غير مصنف'
            };

            // التحقق من صحة البيانات المحدثة
            if (refreshedItem.price <= 0) {
                throw new Error(`سعر المنتج "${refreshedItem.name}" غير صحيح: ${refreshedItem.price}`);
            }

            if (refreshedItem.quantity <= 0) {
                throw new Error(`كمية المنتج "${refreshedItem.name}" غير صحيحة: ${refreshedItem.quantity}`);
            }

            // فحص توفر المخزون
            if (refreshedItem.stock < refreshedItem.quantity) {
                throw new Error(
                    `📦 المخزون غير كافي للمنتج "${refreshedItem.name}"\n` +
                    `المتوفر: ${refreshedItem.stock}\n` +
                    `المطلوب: ${refreshedItem.quantity}\n` +
                    `يرجى تعديل الكمية أو إزالة المنتج من السلة`
                );
            }

            refreshedItems.push(refreshedItem);
            console.log(`✅ تم تحديث بيانات المنتج "${refreshedItem.name}" بنجاح`);
        }

        console.log('✅ تم فحص وتحديث جميع المنتجات بنجاح');
        return refreshedItems;
    };

    // تحديث المخزون بعد الطلب مع معالجة أفضل للأخطاء
    const updateStock = async (items: any[]) => {
        console.log('📦 بدء تحديث المخزون...');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            try {
                console.log(`📝 تحديث مخزون المنتج ${i + 1}/${items.length}: ${item.name}`);

                const productRef = doc(db, 'products', item.id);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    const currentData = productDoc.data();
                    const currentStock = typeof currentData?.stock === 'number' ? currentData.stock : 0;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    console.log(`📊 ${item.name}: ${currentStock} → ${newStock} (خصم ${item.quantity})`);

                    await updateDoc(productRef, {
                        stock: newStock,
                        updatedAt: serverTimestamp() // استخدام server timestamp
                    });

                    console.log(`✅ تم تحديث مخزون "${item.name}" بنجاح`);
                } else {
                    console.error(`❌ المنتج غير موجود لتحديث المخزون: ${item.id}`);
                    throw new Error(`لا يمكن تحديث مخزون المنتج ${item.name}`);
                }
            } catch (error) {
                console.error(`💥 خطأ في تحديث مخزون المنتج ${item.id}:`, error);
                throw error;
            }
        }

        console.log('✅ تم تحديث جميع المخزون بنجاح');
    };

    // معالج إرسال الطلب مع تحسينات
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // التحقق من المصادقة
        if (!user) {
            alert('🔐 يجب تسجيل الدخول أولاً');
            router.push('/auth/login');
            return;
        }

        // التحقق من صحة السلة
        if (!validateCartItems()) {
            alert('❌ توجد مشاكل في السلة:\n\n' + cartValidation.errors.join('\n\n'));
            return;
        }

        // التحقق من صحة النموذج
        const requiredFields = [
            { field: orderData.fullName, name: 'الاسم الكامل' },
            { field: orderData.email, name: 'البريد الإلكتروني' },
            { field: orderData.phone, name: 'رقم الهاتف' },
            { field: orderData.address, name: 'العنوان' },
            { field: orderData.city, name: 'المدينة' }
        ];

        const emptyFields = requiredFields
            .filter(({ field }) => !field || field.trim() === '')
            .map(({ name }) => name);

        if (emptyFields.length > 0) {
            alert(`📋 يرجى تعبئة الحقول التالية:\n• ${emptyFields.join('\n• ')}`);
            return;
        }

        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.email.trim())) {
            alert('📧 يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        // التحقق من رقم الهاتف (مصري)
        const phoneRegex = /^(01)[0-9]{9}$/;
        if (!phoneRegex.test(orderData.phone.replace(/\s+/g, ''))) {
            alert('📱 يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
            return;
        }

        try {
            setLoading(true);
            console.log('🚀 بدء معالجة الطلب...');

            // 1. فحص وتحديث بيانات المنتجات والمخزون
            const refreshedItems = await checkAndRefreshStock();

            // 2. إنشاء عناصر الطلب
            const orderItems = refreshedItems.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
                imageUrl: item.imageUrl || '',
                category: item.category || 'غير مصنف'
            }));

            // 3. حساب المجموع
            const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);

            // 4. إنشاء payload الطلب
            const orderPayload = {
                // معلومات المستخدم
                userId: user.uid,
                userEmail: user.email || orderData.email,

                // معلومات العميل
                customerInfo: {
                    fullName: orderData.fullName.trim(),
                    email: orderData.email.trim(),
                    phone: orderData.phone.trim().replace(/\s+/g, ''),
                    address: orderData.address.trim(),
                    city: orderData.city.trim(),
                    notes: orderData.notes.trim()
                },

                // تفاصيل الطلب
                items: orderItems,
                itemsCount: orderItems.length,
                totalAmount: totalAmount,
                currency: 'EGP',

                // حالة الطلب
                status: 'pending',
                paymentStatus: 'pending',
                paymentMethod: 'cash_on_delivery',

                // التواريخ
                orderDate: serverTimestamp(),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),

                // معلومات إضافية
                source: 'web_app',
                version: '1.0'
            };

            console.log('📄 بيانات الطلب النهائية:', orderPayload);

            // 5. حفظ الطلب في Firebase
            const docRef = await addDoc(collection(db, 'orders'), orderPayload);
            console.log('✅ تم إنشاء الطلب برقم:', docRef.id);

            // 6. تحديث الطلب برقم الطلب
            await updateDoc(doc(db, 'orders', docRef.id), {
                orderNumber: docRef.id,
                updatedAt: serverTimestamp()
            });

            // 7. تحديث المخزون
            await updateStock(refreshedItems);

            // 8. تفريغ السلة
            clearCart();
            console.log('🗑️ تم تفريغ السلة');

            // 9. الانتقال لصفحة نجاح الطلب
            console.log('🎉 تم إنجاز الطلب بنجاح!');
            router.push(`/order-success?orderId=${docRef.id}`);

        } catch (error: any) {
            console.error('💥 خطأ في إنشاء الطلب:', error);

            let errorMessage = 'حدث خطأ غير متوقع';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                errorMessage = `خطأ في قاعدة البيانات: ${error.code}`;
            }

            alert(`❌ فشل في إرسال الطلب:\n\n${errorMessage}\n\nيرجى المحاولة مرة أخرى أو التواصل مع خدمة العملاء`);
        } finally {
            setLoading(false);
        }
    };

    // عرض التحميل أثناء فحص المصادقة
    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>🔄</div>
                <h2>جاري التحقق من حالة تسجيل الدخول...</h2>
            </div>
        );
    }

    // عرض رسالة تسجيل الدخول
    if (!user) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authIcon}>🔐</div>
                <h1>تسجيل الدخول مطلوب</h1>
                <p>يجب تسجيل الدخول أولاً لإتمام عملية الشراء</p>
                <button
                    onClick={() => router.push('/auth/login')}
                    className={styles.loginBtn}
                >
                    تسجيل الدخول الآن
                </button>
            </div>
        );
    }

    // عرض السلة الفارغة
    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>🛒</div>
                <h1>السلة فارغة</h1>
                <p>لا يمكن إتمام الطلب بدون منتجات</p>
                <button
                    onClick={() => router.push('/products')}
                    className={styles.shopBtn}
                >
                    تصفح المنتجات
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>🛍️ إتمام الطلب</h1>
                <p className={styles.subtitle}>تأكد من صحة البيانات قبل التأكيد</p>
            </div>

            {/* تنبيه مشاكل السلة */}
            {!cartValidation.valid && (
                <div className={styles.errorContainer}>
                    <div className={styles.errorHeader}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <h3>مشاكل في السلة يجب حلها:</h3>
                    </div>
                    <ul className={styles.errorList}>
                        {cartValidation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                    <div className={styles.errorActions}>
                        <button
                            onClick={() => router.push('/cart')}
                            className={styles.fixCartBtn}
                        >
                            🔧 إصلاح السلة
                        </button>
                        <button
                            onClick={() => router.push('/products')}
                            className={styles.continueShoppingBtn}
                        >
                            🛍️ متابعة التسوق
                        </button>
                    </div>
                </div>
            )}

            {/* معلومات مهمة */}
            <div className={styles.infoBox}>
                <h3 className={styles.infoTitle}>📋 معلومات مهمة:</h3>
                <ul className={styles.infoList}>
                    <li>✅ سيتم التحقق من توفر المنتجات وتحديث البيانات تلقائياً</li>
                    <li>📦 سيتم حجز المنتجات فور تأكيد الطلب</li>
                    <li>🚚 التوصيل خلال 3-7 أيام عمل</li>
                    <li>💰 الدفع عند الاستلام</li>
                    <li>📞 سيتم التواصل معك لتأكيد الطلب</li>
                </ul>
            </div>

            {/* ملخص الطلب */}
            <div className={styles.orderSummary}>
                <h2 className={styles.summaryTitle}>📋 ملخص الطلب</h2>
                <div className={styles.summaryContent}>
                    {cartItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>
                                    {item.name || 'اسم غير متوفر'}
                                    {(!item.name || item.name === 'اسم المنتج غير متوفر') && (
                                        <span className={styles.warningText}> ⚠️</span>
                                    )}
                                </span>
                                <span className={styles.itemQuantity}>× {item.quantity || 0}</span>
                            </div>
                            <span className={styles.itemPrice}>
                                {(item.price && item.quantity && !isNaN(item.price * item.quantity))
                                    ? (item.price * item.quantity).toFixed(2)
                                    : '0.00'
                                } ج.م
                            </span>
                        </div>
                    ))}

                    <div className={styles.summaryDivider}></div>

                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>💰 الإجمالي:</span>
                        <span className={styles.totalAmount}>
                            {(getTotalPrice() && !isNaN(getTotalPrice()))
                                ? getTotalPrice().toFixed(2)
                                : '0.00'
                            } ج.م
                        </span>
                    </div>
                </div>
            </div>

            {/* نموذج بيانات التوصيل */}
            <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                <h2 className={styles.formTitle}>📍 بيانات التوصيل</h2>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName" className={styles.formLabel}>
                            👤 الاسم الكامل *
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={orderData.fullName}
                            onChange={(e) => setOrderData({ ...orderData, fullName: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="أدخل اسمك الكامل"
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            📧 البريد الإلكتروني *
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={orderData.email}
                            onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="example@email.com"
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.formLabel}>
                            📱 رقم الهاتف *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={orderData.phone}
                            onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="01012345678"
                            maxLength={11}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="city" className={styles.formLabel}>
                            🏘️ المدينة *
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={orderData.city}
                            onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="القاهرة، الإسكندرية، الجيزة..."
                            maxLength={50}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="address" className={styles.formLabel}>
                            🏠 العنوان التفصيلي *
                        </label>
                        <textarea
                            id="address"
                            value={orderData.address}
                            onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                            required
                            className={styles.formTextarea}
                            placeholder="أدخل عنوانك بالتفصيل مع رقم الشارع والمنطقة..."
                            maxLength={300}
                            rows={3}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.formLabel}>
                            📝 ملاحظات إضافية (اختيارية)
                        </label>
                        <textarea
                            id="notes"
                            value={orderData.notes}
                            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                            placeholder="أي ملاحظات خاصة بالطلب أو التوصيل..."
                            className={styles.formTextarea}
                            maxLength={500}
                            rows={3}
                        />
                    </div>
                </div>

                <div className={styles.submitSection}>
                    <button
                        type="submit"
                        disabled={loading || !cartValidation.valid}
                        className={`${styles.submitBtn} ${(loading || !cartValidation.valid) ? styles.submitBtnDisabled : ''
                            }`}
                    >
                        {loading ? (
                            <>🔄 جاري التحقق وإرسال الطلب...</>
                        ) : cartValidation.valid ? (
                            <>✅ تأكيد الطلب ({(getTotalPrice() && !isNaN(getTotalPrice())) ? getTotalPrice().toFixed(2) : '0.00'} ج.م)</>
                        ) : (
                            <>⚠️ يرجى إصلاح مشاكل السلة أولاً</>
                        )}
                    </button>

                    {cartValidation.valid && (
                        <p className={styles.submitNote}>
                            بالضغط على "تأكيد الطلب" فإنك توافق على شروط الخدمة
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}