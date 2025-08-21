'use client';
// app/checkout/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import styles from './checkout.module.css';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
}

export default function CheckoutPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const router = useRouter();

    // مراقبة حالة المصادقة
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                setCustomerInfo(prev => ({
                    ...prev,
                    email: currentUser.email || ''
                }));
                fetchCartItems(currentUser);
            }
        });

        return () => unsubscribe();
    }, []);

    // جلب عناصر السلة
    const fetchCartItems = async (currentUser?: User) => {
        const userToUse = currentUser || user;
        if (!userToUse || !db) return;

        const fetchCartItems = async (currentUser?: User) => {
            const userToUse = currentUser || user;
            if (!userToUse || !db) return;

            try {
                const cartDoc = await getDoc(doc(db, 'carts', userToUse.uid));
                if (cartDoc.exists()) {
                    const cartData = cartDoc.data();
                    setCartItems(cartData.items || []);
                    setDebugInfo(`تم جلب ${cartData.items?.length || 0} عنصر من السلة`);
                } else {
                    setDebugInfo('السلة فارغة');
                }
            } catch (err) {
                console.error('خطأ في جلب السلة:', err);
                setError('حدث خطأ في جلب بيانات السلة');
            }
        };

        // حساب المجموع
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // معالجة التغييرات في النموذج
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setCustomerInfo(prev => ({
                ...prev,
                [name]: value
            }));
        };

        // إرسال الطلب
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!user) {
                setError('يجب تسجيل الدخول أولاً');
                return;
            }

            if (cartItems.length === 0) {
                setError('السلة فارغة');
                return;
            }

            // التحقق من البيانات
            if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
                setError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            setIsSubmitting(true);
            setError('');
            setDebugInfo('جاري إرسال الطلب...');

            try {
                // إنشاء الطلب
                const orderData = {
                    userId: user.uid,
                    customerInfo,
                    items: cartItems,
                    totalAmount,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    orderNumber: `ORDER-${Date.now()}`
                };

                setDebugInfo('جاري حفظ الطلب...');
                const docRef = await addDoc(collection(db, 'orders'), orderData);

                setDebugInfo('جاري مسح السلة...');
                // مسح السلة بعد إكمال الطلب
                await deleteDoc(doc(db, 'carts', user.uid));

                setDebugInfo('تم إنشاء الطلب بنجاح!');

                // التوجه لصفحة نجاح الطلب
                setTimeout(() => {
                    router.push(`/order-success?orderId=${docRef.id}`);
                }, 1000);

            } catch (err) {
                console.error('خطأ في إرسال الطلب:', err);
                setError('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
                setDebugInfo(`خطأ: ${err}`);
            } finally {
                setIsSubmitting(false);
            }
        };

        // التحقق من المصادقة
        if (loading) {
            return (
                <div className={styles.container}>
                    <div className={styles.loading}>جاري التحميل...</div>
                </div>
            );
        }

        if (!user) {
            router.push('/auth/login');
            return null;
        }

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>إكمال الطلب</h1>

                    {error && <div className={styles.error}>{error}</div>}
                    {debugInfo && <div className={styles.debug}>🔍 {debugInfo}</div>}

                    <div className={styles.checkoutGrid}>
                        {/* معلومات الطلب */}
                        <div className={styles.orderSummary}>
                            <h2>ملخص الطلب</h2>

                            {cartItems.length === 0 ? (
                                <p>السلة فارغة</p>
                            ) : (
                                <>
                                    {cartItems.map((item) => (
                                        <div key={item.id} className={styles.orderItem}>
                                            <div className={styles.itemInfo}>
                                                <h4>{item.name}</h4>
                                                <span>الكمية: {item.quantity}</span>
                                            </div>
                                            <div className={styles.itemPrice}>
                                                {(item.price * item.quantity).toFixed(2)} ج.م
                                            </div>
                                        </div>
                                    ))}

                                    <div className={styles.total}>
                                        <strong>المجموع: {totalAmount.toFixed(2)} ج.م</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* نموذج معلومات العميل */}
                        <div className={styles.customerForm}>
                            <h2>معلومات التوصيل</h2>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="fullName">الاسم الكامل *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={customerInfo.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        disabled={isSubmitting}
                                        readOnly
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="phone">رقم الهاتف *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                        disabled={isSubmitting}
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="city">المدينة *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={customerInfo.city}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="address">العنوان التفصيلي *</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.textarea}
                                        disabled={isSubmitting}
                                        rows={3}
                                        placeholder="الشارع، رقم المبنى، تفاصيل إضافية..."
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="notes">ملاحظات إضافية</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={customerInfo.notes}
                                        onChange={handleInputChange}
                                        className={styles.textarea}
                                        disabled={isSubmitting}
                                        rows={2}
                                        placeholder="أي ملاحظات خاصة بالطلب..."
                                    />
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className={styles.backBtn}
                                        disabled={isSubmitting}
                                    >
                                        العودة
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || cartItems.length === 0}
                                        className={styles.submitBtn}
                                    >
                                        {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* معلومات إضافية */}
                    <div className={styles.info}>
                        <h3>معلومات مهمة:</h3>
                        <ul>
                            <li>سيتم التوصيل خلال 2-3 أيام عمل</li>
                            <li>الدفع عند الاستلام</li>
                            <li>يمكنك تتبع طلبك من حسابك</li>
                            <li>رسوم التوصيل: 50 ج.م داخل القاهرة، 80 ج.م خارجها</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}