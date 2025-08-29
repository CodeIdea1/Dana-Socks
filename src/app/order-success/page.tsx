'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
    CheckCircle2,
    Package,
    Calendar,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Hash,
    ShoppingBag,
    ArrowRight,
    Clock,
    Truck,
    Shield,
    Eye,
    MessageCircle
} from 'lucide-react';
import styles from './order-success.module.css';

interface OrderData {
    orderNumber: string;
    totalAmount: number;
    orderDate: string;
    createdAt: string;
    userId: string;
    customerInfo: {
        fullName: string;
        phone: string;
        city: string;
        address: string;
        email: string;
    };
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    status: string;
}

export default function OrderSuccessPage() {
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (!orderId) {
            router.push('/products');
            return;
        }

        if (user && orderId) {
            fetchOrderData();
        }
    }, [orderId, user, authLoading]);

    const fetchOrderData = async () => {
        if (!orderId || !db || !user) return;

        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (orderDoc.exists()) {
                const data = orderDoc.data() as OrderData;

                if (data.userId !== user.uid) {
                    setError('Access denied to this order');
                    return;
                }

                setOrderData({
                    ...data,
                    orderNumber: orderId
                });
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Error fetching order data:', err);
            setError('Error occurred while fetching order data');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Login Required</h2>
                    <p>You must be logged in to view order details</p>
                    <Link href="/auth/login" className={styles.button}>
                        <User size={20} />
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Sorry, an error occurred</h2>
                    <p>{error}</p>
                    <Link href="/products" className={styles.button}>
                        <ShoppingBag size={20} />
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.successCard}>
                    <div className={styles.iconContainer}>
                        <CheckCircle2 size={40} color="white" />
                    </div>

                    <h1 className={styles.title}>Order Submitted Successfully!</h1>

                    <p className={styles.message}>
                        Thank you {orderData?.customerInfo?.fullName}! Your order has been received and we will contact you soon to confirm delivery.
                    </p>

                    {orderData && (
                        <div className={styles.orderDetails}>
                            <h2>
                                <Package size={24} />
                                Order Details
                            </h2>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <Hash size={18} />
                                    Order Number:
                                </span>
                                <span className={styles.value}>{orderData.orderNumber}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <CreditCard size={18} />
                                    Total:
                                </span>
                                <span className={styles.value}>{orderData.totalAmount.toFixed(2)} EGP</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <Calendar size={18} />
                                    Order Date:
                                </span>
                                <span className={styles.value}>
                                    {new Date(orderData.orderDate || orderData.createdAt).toLocaleDateString('en-US')}
                                </span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <Clock size={18} />
                                    Status:
                                </span>
                                <span className={styles.value}>
                                    {orderData.status === 'pending' ? 'Under Review' : orderData.status}
                                </span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <User size={18} />
                                    Customer Name:
                                </span>
                                <span className={styles.value}>{orderData.customerInfo.fullName}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <Phone size={18} />
                                    Phone Number:
                                </span>
                                <span className={styles.value}>{orderData.customerInfo.phone}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <Mail size={18} />
                                    Email:
                                </span>
                                <span className={styles.value}>{orderData.customerInfo.email}</span>
                            </div>

                            <div className={styles.detail}>
                                <span className={styles.label}>
                                    <MapPin size={18} />
                                    Delivery Address:
                                </span>
                                <span className={styles.value}>
                                    {orderData.customerInfo.address}, {orderData.customerInfo.city}
                                </span>
                            </div>

                            {orderData.items && orderData.items.length > 0 && (
                                <div className={styles.orderItems}>
                                    <h3>
                                        <ShoppingBag size={20} />
                                        Ordered Products:
                                    </h3>
                                    {orderData.items.map((item, index) => (
                                        <div key={index} className={styles.orderItem}>
                                            <span>{item.productName} × {item.quantity}</span>
                                            <span>{item.subtotal} EGP</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.nextSteps}>
                        <h3>
                            <ArrowRight size={20} />
                            Next Steps:
                        </h3>
                        <ul>
                            <li>
                                <Phone size={16} className={styles.stepIcon} />
                                We will contact you within 24 hours to confirm the order
                            </li>
                            <li>
                                <Truck size={16} className={styles.stepIcon} />
                                Your order will be delivered within 2-3 business days
                            </li>
                            <li>
                                <CreditCard size={16} className={styles.stepIcon} />
                                Payment on delivery
                            </li>
                            <li>
                                <Eye size={16} className={styles.stepIcon} />
                                You can track your order status from your account
                            </li>
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/products" className={styles.button}>
                            <ShoppingBag size={20} />
                            Continue Shopping
                        </Link>
                    </div>

                    <div className={styles.contact}>
                        <p>
                            <Shield size={20} />
                            <strong>Need Help?</strong>
                            <a href="https://wa.me/+201000000000">
                                <MessageCircle size={18} />
                                Contact us via WhatsApp: 01000000000
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}