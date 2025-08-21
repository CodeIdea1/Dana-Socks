// app/checkout/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>جاري التحميل...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>يجب تسجيل الدخول للمتابعة</h1>
                <button
                    onClick={() => router.push('/auth/login')}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    تسجيل الدخول
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>السلة فارغة</h1>
                <button
                    onClick={() => router.push('/products')}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    تسوق الآن
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>إتمام الطلب</h1>

            {/* تحذير المخزون */}
            <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b3d9ff' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>📦 ملاحظة مهمة:</h3>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#0066cc' }}>
                    <li>سيتم خصم الكميات من المخزون فور تأكيد الطلب</li>
                    <li>في حالة عدم توفر الكمية المطلوبة، سيتم إلغاء الطلب</li>
                    <li>سيتم تحضير الطلب وشحنه خلال 3-7 أيام عمل</li>
                </ul>
            </div>

            {/* ملخص الطلب */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>ملخص الطلب</h2>
                {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ج.م</span>
                    </div>
                ))}
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>الإجمالي:</span>
                    <span>{getTotalPrice().toFixed(2)} ج.م</span>
                </div>
            </div>

            {/* نموذج بيانات العميل */}
            <form onSubmit={handleSubmit}>
                <h2>بيانات التوصيل</h2>

                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الاسم الكامل *</label>
                        <input
                            type="text"
                            value={orderData.fullName}
                            onChange={(e) => setOrderData({ ...orderData, fullName: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>البريد الإلكتروني *</label>
                        <input
                            type="email"
                            value={orderData.email}
                            onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>رقم الهاتف *</label>
                        <input
                            type="tel"
                            value={orderData.phone}
                            onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>العنوان *</label>
                        <textarea
                            value={orderData.address}
                            onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                minHeight: '80px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>المدينة *</label>
                        <input
                            type="text"
                            value={orderData.city}
                            onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ملاحظات إضافية</label>
                        <textarea
                            value={orderData.notes}
                            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                            placeholder="أي ملاحظات خاصة بالطلب..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                minHeight: '60px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? '#6c757d' : '#28a745',
                        color: 'white',
                        padding: '15px 30px',
                        fontSize: '18px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        width: '100%',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'جاري فحص المخزون وإرسال الطلب...' : `تأكيد الطلب (${getTotalPrice().toFixed(2)} ج.م)`}
                </button>
            </form>
        </div>
    );
}