// app/admin/dashboard/page.tsx
'use client';
import { Timestamp } from "firebase/firestore";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    DocumentData
} from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import styles from './dashboard.module.css';

// تعريف الأنواع (Types)
interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string; // تم تغيير image إلى imageUrl
    category?: string;
    stock: number;
    createdAt?: any;
    updatedAt?: any;
}

interface Order {
    id: string;
    userId: string;
    customerInfo?: {
        fullName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
    };
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    totalAmount: number;
    status?: string;
    createdAt?: any;
    updatedAt?: any;
}

interface User {
    id: string;
    name?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt?: any;
}

interface NewProductForm {
    name: string;
    price: string;
    description: string;
    imageUrl: string; // تم تغيير image إلى imageUrl
    category: string;
    stock: string;
}


const ADMIN_EMAILS = ['sajaahmed1007@gmail.com', 'sajaahmed1007@gmail.com']; // ضع إيميلات الأدمن هنا

export default function AdminDashboard() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // حالات إضافة منتج جديد
    const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
    const [newProduct, setNewProduct] = useState<NewProductForm>({
        name: '',
        price: '',
        description: '',
        imageUrl: '', // تم تغيير image إلى imageUrl
        category: '',
        stock: ''
    });

    // حالات تعديل المنتج
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // حالات عرض تفاصيل الطلب
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);

    // التحقق من صلاحيات الأدمن
    const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
            return;
        }

        if (isAdmin) {
            fetchData();
        }
    }, [user, loading, isAdmin, router]);

    const fetchData = async (): Promise<void> => {
        try {
            setIsLoading(true);

            // جلب المنتجات
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const productsData: Product[] = productsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    // التعامل مع الحقول القديمة والجديدة للصور
                    imageUrl: data.imageUrl || data.image || '',
                    category: data.category,
                    stock: data.stock,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                } as Product;
            });
            setProducts(productsData);

            // جلب الطلبات
            const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData: Order[] = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order));
            setOrders(ordersData);

            // جلب المستخدمين
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData: User[] = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User));

            // طباعة البيانات للتشخيص
            console.log('Users sample data:', usersData.slice(0, 2));
            console.log('Users fields:', usersData[0] ? Object.keys(usersData[0]) : 'No users');

            setUsers(usersData);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('حدث خطأ في تحميل البيانات');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const productData = {
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                description: newProduct.description,
                imageUrl: newProduct.imageUrl, // تم تغيير image إلى imageUrl
                category: newProduct.category,
                stock: parseInt(newProduct.stock),
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'products'), productData);

            setNewProduct({
                name: '',
                price: '',
                description: '',
                imageUrl: '', // تم تغيير image إلى imageUrl
                category: '',
                stock: ''
            });
            setShowAddProduct(false);
            fetchData();
            alert('تم إضافة المنتج بنجاح!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('حدث خطأ في إضافة المنتج');
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const productRef = doc(db, 'products', editingProduct.id);
            const updateData = {
                name: editingProduct.name,
                price: editingProduct.price,
                description: editingProduct.description,
                imageUrl: editingProduct.imageUrl, // تم تغيير image إلى imageUrl
                category: editingProduct.category,
                stock: editingProduct.stock,
                updatedAt: serverTimestamp()
            };

            await updateDoc(productRef, updateData);

            setEditingProduct(null);
            fetchData();
            alert('تم تحديث المنتج بنجاح!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('حدث خطأ في تحديث المنتج');
        }
    };

    const handleDeleteProduct = async (productId: string): Promise<void> => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await deleteDoc(doc(db, 'products', productId));
                fetchData();
                alert('تم حذف المنتج بنجاح!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('حدث خطأ في حذف المنتج');
            }
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string): Promise<void> => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            fetchData();
            alert('تم تحديث حالة الطلب!');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('حدث خطأ في تحديث الطلب');
        }
    };

    const handleViewOrderDetails = (order: Order): void => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatDate = (timestamp: any): string => {
        try {
            if (timestamp instanceof Timestamp) {
                return timestamp.toDate().toLocaleString('ar-EG');
            }
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('ar-EG');
            }
            return 'غير محدد';
        } catch {
            return 'غير محدد';
        }
    };
    if (loading || isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className={styles.unauthorizedContainer}>
                <div className={styles.unauthorizedContent}>
                    <h1 className={styles.unauthorizedTitle}>غير مصرح لك بالدخول</h1>
                    <p className={styles.unauthorizedText}>ليس لديك صلاحيات للوصول إلى لوحة الإدارة</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard} dir="rtl">
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContainer}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.headerTitle}>لوحة إدارة المتجر</h1>
                        <div className={styles.headerActions}>
                            <span className={styles.welcomeText}>مرحباً، {user?.email}</span>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                تسجيل الخروج
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.mainContainer}>
                {/* الإحصائيات السريعة */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>إجمالي المنتجات</p>
                                <p className={styles.statValue}>{products.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>إجمالي الطلبات</p>
                                <p className={styles.statValue}>{orders.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>إجمالي المستخدمين</p>
                                <p className={styles.statValue}>{users.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* التنقل والمحتوى */}
                <div className={styles.contentCard}>
                    <div className={styles.tabsContainer}>
                        <nav className={styles.tabsNav}>
                            {[
                                { id: 'products' as const, name: 'المنتجات', count: products.length },
                                { id: 'orders' as const, name: 'الطلبات', count: orders.length },
                                { id: 'users' as const, name: 'المستخدمين', count: users.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                >
                                    {tab.name}
                                    <span className={styles.tabBadge}>{tab.count}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* محتوى المنتجات */}
                    {activeTab === 'products' && (
                        <div className={styles.tabContent}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>إدارة المنتجات</h2>
                                <button
                                    onClick={() => setShowAddProduct(true)}
                                    className={styles.addButton}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    إضافة منتج جديد
                                </button>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHeader}>
                                        <tr>
                                            <th className={styles.tableHeaderCell}>المنتج</th>
                                            <th className={styles.tableHeaderCell}>السعر</th>
                                            <th className={styles.tableHeaderCell}>المخزون</th>
                                            <th className={styles.tableHeaderCell}>الفئة</th>
                                            <th className={styles.tableHeaderCell}>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tableBody}>
                                        {products.map((product) => (
                                            <tr key={product.id} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    <div className={styles.productInfo}>
                                                        <div className={styles.productImage}>
                                                            <img
                                                                src={product.imageUrl || '/placeholder.png'}
                                                                alt={product.name}
                                                            />
                                                        </div>
                                                        <div className={styles.productDetails}>
                                                            <div className={styles.productName}>{product.name}</div>
                                                            <div className={styles.productDescription}>
                                                                {product.description && product.description.length > 50
                                                                    ? `${product.description.substring(0, 50)}...`
                                                                    : product.description || 'لا يوجد وصف'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.tableCell}>{product.price} ر.س</td>
                                                <td className={styles.tableCell}>{product.stock}</td>
                                                <td className={styles.tableCell}>{product.category || 'غير محدد'}</td>
                                                <td className={styles.tableCell}>
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        className={styles.editButton}
                                                        aria-label={`تعديل منتج ${product.name}`}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className={styles.deleteButton}
                                                        aria-label={`حذف منتج ${product.name}`}
                                                    >
                                                        حذف
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* محتوى الطلبات */}
                    {activeTab === 'orders' && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>إدارة الطلبات</h2>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHeader}>
                                        <tr>
                                            <th className={styles.tableHeaderCell}>رقم الطلب</th>
                                            <th className={styles.tableHeaderCell}>العميل</th>
                                            <th className={styles.tableHeaderCell}>المبلغ الإجمالي</th>
                                            <th className={styles.tableHeaderCell}>الحالة</th>
                                            <th className={styles.tableHeaderCell}>التاريخ</th>
                                            <th className={styles.tableHeaderCell}>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tableBody}>
                                        {orders.map((order) => (
                                            <tr key={order.id} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    <span className={styles.orderId}>#{order.id.substring(0, 8)}</span>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {order.customerInfo?.fullName || 'غير محدد'}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {order.totalAmount} ر.س
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <label htmlFor={`order-status-${order.id}`} className="sr-only">
                                                        تغيير حالة الطلب #{order.id.substring(0, 8)}
                                                    </label>
                                                    <select
                                                        id={`order-status-${order.id}`}
                                                        value={order.status || 'pending'}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={styles.statusSelect}
                                                        aria-label={`حالة الطلب #{order.id.substring(0, 8)}`}
                                                    >
                                                        <option value="pending">قيد الانتظار</option>
                                                        <option value="processing">قيد التجهيز</option>
                                                        <option value="shipped">تم الشحن</option>
                                                        <option value="delivered">تم التوصيل</option>
                                                        <option value="cancelled">ملغي</option>
                                                    </select>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <button
                                                        onClick={() => handleViewOrderDetails(order)}
                                                        className={styles.viewButton}
                                                        aria-label={`عرض تفاصيل الطلب #{order.id.substring(0, 8)}`}
                                                    >
                                                        عرض التفاصيل
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* محتوى المستخدمين */}
                    {activeTab === 'users' && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>إدارة المستخدمين</h2>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHeader}>
                                        <tr>
                                            <th className={styles.tableHeaderCell}>الاسم</th>
                                            <th className={styles.tableHeaderCell}>البريد الإلكتروني</th>
                                            <th className={styles.tableHeaderCell}>تاريخ التسجيل</th>
                                            <th className={styles.tableHeaderCell}>عدد الطلبات</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tableBody}>
                                        {users.map((user) => (
                                            <tr key={user.id} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    {user.displayName ||
                                                        user.name ||
                                                        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
                                                        user.email?.split('@')[0] ||
                                                        'غير محدد'}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {user.email}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {orders.filter(order => order.userId === user.id).length}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* نموذج إضافة منتج */}
            {showAddProduct && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>إضافة منتج جديد</h3>
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-name" className={styles.formLabel}>اسم المنتج</label>
                                <input
                                    id="new-product-name"
                                    type="text"
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="أدخل اسم المنتج"
                                    aria-describedby="new-product-name-desc"
                                />
                                <small id="new-product-name-desc" className="sr-only">اسم المنتج مطلوب</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-price" className={styles.formLabel}>السعر</label>
                                <input
                                    id="new-product-price"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="0.00"
                                    aria-describedby="new-product-price-desc"
                                />
                                <small id="new-product-price-desc" className="sr-only">السعر مطلوب بالريال السعودي</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-description" className={styles.formLabel}>الوصف</label>
                                <textarea
                                    id="new-product-description"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className={styles.formTextarea}
                                    rows={3}
                                    placeholder="وصف المنتج (اختياري)"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-imageUrl" className={styles.formLabel}>رابط الصورة</label>
                                <input
                                    id="new-product-imageUrl"
                                    type="url"
                                    value={newProduct.imageUrl}
                                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-category" className={styles.formLabel}>الفئة</label>
                                <input
                                    id="new-product-category"
                                    type="text"
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="فئة المنتج"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-product-stock" className={styles.formLabel}>المخزون</label>
                                <input
                                    id="new-product-stock"
                                    type="number"
                                    required
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="0"
                                    aria-describedby="new-product-stock-desc"
                                />
                                <small id="new-product-stock-desc" className="sr-only">كمية المخزون مطلوبة</small>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddProduct(false)}
                                    className={styles.cancelButton}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    إضافة المنتج
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* نموذج تعديل منتج */}
            {editingProduct && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>تعديل المنتج</h3>
                        </div>
                        <form onSubmit={handleUpdateProduct}>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-name" className={styles.formLabel}>اسم المنتج</label>
                                <input
                                    id="edit-product-name"
                                    type="text"
                                    required
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="أدخل اسم المنتج"
                                    aria-describedby="edit-product-name-desc"
                                />
                                <small id="edit-product-name-desc" className="sr-only">اسم المنتج مطلوب</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-price" className={styles.formLabel}>السعر</label>
                                <input
                                    id="edit-product-price"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                    className={styles.formInput}
                                    placeholder="0.00"
                                    aria-describedby="edit-product-price-desc"
                                />
                                <small id="edit-product-price-desc" className="sr-only">السعر مطلوب بالريال السعودي</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-description" className={styles.formLabel}>الوصف</label>
                                <textarea
                                    id="edit-product-description"
                                    value={editingProduct.description || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className={styles.formTextarea}
                                    rows={3}
                                    placeholder="وصف المنتج (اختياري)"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-imageUrl" className={styles.formLabel}>رابط الصورة</label>
                                <input
                                    id="edit-product-imageUrl"
                                    type="url"
                                    value={editingProduct.imageUrl || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-category" className={styles.formLabel}>الفئة</label>
                                <input
                                    id="edit-product-category"
                                    type="text"
                                    value={editingProduct.category || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="فئة المنتج"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-product-stock" className={styles.formLabel}>المخزون</label>
                                <input
                                    id="edit-product-stock"
                                    type="number"
                                    required
                                    value={editingProduct.stock}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                    className={styles.formInput}
                                    placeholder="0"
                                    aria-describedby="edit-product-stock-desc"
                                />
                                <small id="edit-product-stock-desc" className="sr-only">كمية المخزون مطلوبة</small>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className={styles.cancelButton}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    تحديث المنتج
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* نموذج عرض تفاصيل الطلب */}
            {showOrderDetails && selectedOrder && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                تفاصيل الطلب #{selectedOrder.id.substring(0, 8)}
                            </h3>
                        </div>
                        <div className={styles.orderDetailsContent}>
                            <div className={styles.orderSection}>
                                <h4>معلومات العميل:</h4>
                                <p><strong>الاسم:</strong> {selectedOrder.customerInfo?.fullName || 'غير محدد'}</p>
                                <p><strong>البريد:</strong> {selectedOrder.customerInfo?.email || 'غير محدد'}</p>
                                <p><strong>الهاتف:</strong> {selectedOrder.customerInfo?.phone || 'غير محدد'}</p>
                                <p><strong>المدينة:</strong> {selectedOrder.customerInfo?.city || 'غير محدد'}</p>
                                <p><strong>العنوان:</strong> {selectedOrder.customerInfo?.address || 'غير محدد'}</p>
                            </div>

                            <div className={styles.orderSection}>
                                <h4>المنتجات:</h4>
                                {selectedOrder.items?.map((item: any, index: number) => (
                                    <div key={index} className={styles.orderItem}>
                                        <div className={styles.orderItemDetails}>
                                            <span className={styles.itemName}>{item.productName}</span>
                                            <span className={styles.itemQuantity}>الكمية: {item.quantity}</span>
                                            <span className={styles.itemPrice}>السعر: {item.price} ر.س</span>
                                            <span className={styles.itemSubtotal}>المجموع: {item.subtotal} ر.س</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderSection}>
                                <div className={styles.orderSummary}>
                                    <p><strong>المبلغ الإجمالي:</strong> {selectedOrder.totalAmount} ر.س</p>
                                    <p><strong>الحالة:</strong> {
                                        selectedOrder.status === 'pending' ? 'قيد الانتظار' :
                                            selectedOrder.status === 'processing' ? 'قيد التجهيز' :
                                                selectedOrder.status === 'shipped' ? 'تم الشحن' :
                                                    selectedOrder.status === 'delivered' ? 'تم التوصيل' :
                                                        selectedOrder.status === 'cancelled' ? 'ملغي' : 'غير محدد'
                                    }</p>
                                    <p><strong>تاريخ الطلب:</strong> {formatDate(selectedOrder.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOrderDetails(false);
                                    setSelectedOrder(null);
                                }}
                                className={styles.cancelButton}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}