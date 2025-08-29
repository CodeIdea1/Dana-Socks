'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Mail, Phone, MapPin, Building, FileText, CreditCard, ShieldCheck, Truck, Clock, AlertTriangle, CheckCircle, RefreshCw, Lock, Package, Eye } from 'lucide-react';
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

    const validateCartItems = () => {
        const errors: string[] = [];
        let isValid = true;

        console.log('Validating cart items:', cartItems);

        if (!cartItems || cartItems.length === 0) {
            errors.push('Cart is empty - Please add products first');
            isValid = false;
            setCartValidation({ valid: isValid, errors });
            return isValid;
        }

        cartItems.forEach((item, index) => {
            const itemNumber = index + 1;

            if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
                errors.push(`Product ${itemNumber}: Invalid product ID`);
                isValid = false;
            }

            if (!item.name || typeof item.name !== 'string' ||
                item.name.trim() === '' ||
                item.name === 'Product name not available' ||
                item.name === 'Not specified') {
                errors.push(`Product ${itemNumber}: Missing or invalid product name`);
                isValid = false;
            }

            if (!item.price ||
                typeof item.price !== 'number' ||
                isNaN(item.price) ||
                item.price <= 0) {
                errors.push(`Product "${item.name || 'Unknown'}": Invalid price (${item.price})`);
                isValid = false;
            }

            if (!item.quantity ||
                typeof item.quantity !== 'number' ||
                isNaN(item.quantity) ||
                item.quantity <= 0 ||
                !Number.isInteger(item.quantity)) {
                errors.push(`Product "${item.name || 'Unknown'}": Invalid quantity (${item.quantity})`);
                isValid = false;
            }

            if (!item.imageUrl || item.imageUrl.trim() === '') {
                console.warn(`Product "${item.name}": No image available`);
            }
        });

        const totalPrice = getTotalPrice();
        if (!totalPrice ||
            typeof totalPrice !== 'number' ||
            isNaN(totalPrice) ||
            totalPrice <= 0) {
            errors.push(`Invalid total amount: ${totalPrice} EGP`);
            isValid = false;
        }

        console.log(isValid ? 'Cart is valid' : 'Cart has errors:', errors);
        setCartValidation({ valid: isValid, errors });
        return isValid;
    };

    useEffect(() => {
        if (user?.email && orderData.email !== user.email) {
            setOrderData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user?.email]);

    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            validateCartItems();
        }
    }, [cartItems, getTotalPrice]);

    const refreshProductData = async (productId: string) => {
        try {
            console.log(`Fetching product data: ${productId}`);
            const productDoc = await getDoc(doc(db, 'products', productId));

            if (productDoc.exists()) {
                const data = productDoc.data();
                console.log(`Product data fetched successfully:`, data);
                return data;
            } else {
                console.error(`Product not found: ${productId}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
        }
    };

    const checkAndRefreshStock = async () => {
        console.log('Starting stock check and data refresh...');
        const refreshedItems = [];

        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            console.log(`Processing product ${i + 1}/${cartItems.length}: ${item.name}`);

            const productData = await refreshProductData(item.id);

            if (!productData) {
                throw new Error(`Product "${item.name || item.id}" no longer exists in database`);
            }

            const refreshedItem = {
                id: item.id,
                name: productData.name || item.name || 'Unknown product',
                price: typeof productData.price === 'number' ? productData.price : (item.price || 0),
                imageUrl: productData.imageUrl || item.imageUrl || '',
                stock: typeof productData.stock === 'number' ? productData.stock : 0,
                quantity: item.quantity,
                category: productData.category || item.category || 'Uncategorized'
            };

            if (refreshedItem.price <= 0) {
                throw new Error(`Invalid price for product "${refreshedItem.name}": ${refreshedItem.price}`);
            }

            if (refreshedItem.quantity <= 0) {
                throw new Error(`Invalid quantity for product "${refreshedItem.name}": ${refreshedItem.quantity}`);
            }

            if (refreshedItem.stock < refreshedItem.quantity) {
                throw new Error(
                    `Insufficient stock for product "${refreshedItem.name}"\n` +
                    `Available: ${refreshedItem.stock}\n` +
                    `Required: ${refreshedItem.quantity}\n` +
                    `Please adjust quantity or remove product from cart`
                );
            }

            refreshedItems.push(refreshedItem);
            console.log(`Product "${refreshedItem.name}" data updated successfully`);
        }

        console.log('All products checked and updated successfully');
        return refreshedItems;
    };

    const updateStock = async (items: any[]) => {
        console.log('Starting stock update...');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            try {
                console.log(`Updating stock for product ${i + 1}/${items.length}: ${item.name}`);

                const productRef = doc(db, 'products', item.id);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    const currentData = productDoc.data();
                    const currentStock = typeof currentData?.stock === 'number' ? currentData.stock : 0;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    console.log(`${item.name}: ${currentStock} → ${newStock} (deduct ${item.quantity})`);

                    await updateDoc(productRef, {
                        stock: newStock,
                        updatedAt: serverTimestamp()
                    });

                    console.log(`Stock updated for "${item.name}" successfully`);
                } else {
                    console.error(`Product not found for stock update: ${item.id}`);
                    throw new Error(`Cannot update stock for product ${item.name}`);
                }
            } catch (error) {
                console.error(`Error updating stock for product ${item.id}:`, error);
                throw error;
            }
        }

        console.log('All stock updated successfully');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please login first');
            router.push('/auth/login');
            return;
        }

        if (!validateCartItems()) {
            alert('Cart validation errors:\n\n' + cartValidation.errors.join('\n\n'));
            return;
        }

        const requiredFields = [
            { field: orderData.fullName, name: 'Full Name' },
            { field: orderData.email, name: 'Email' },
            { field: orderData.phone, name: 'Phone Number' },
            { field: orderData.address, name: 'Address' },
            { field: orderData.city, name: 'City' }
        ];

        const emptyFields = requiredFields
            .filter(({ field }) => !field || field.trim() === '')
            .map(({ name }) => name);

        if (emptyFields.length > 0) {
            alert(`Please fill the following fields:\n• ${emptyFields.join('\n• ')}`);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.email.trim())) {
            alert('Please enter a valid email address');
            return;
        }

        const phoneRegex = /^(01)[0-9]{9}$/;
        if (!phoneRegex.test(orderData.phone.replace(/\s+/g, ''))) {
            alert('Please enter a valid Egyptian phone number (example: 01012345678)');
            return;
        }

        try {
            setLoading(true);
            console.log('Starting order processing...');

            const refreshedItems = await checkAndRefreshStock();

            const orderItems = refreshedItems.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
                imageUrl: item.imageUrl || '',
                category: item.category || 'Uncategorized'
            }));

            const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);

            const orderPayload = {
                userId: user.uid,
                userEmail: user.email || orderData.email,

                customerInfo: {
                    fullName: orderData.fullName.trim(),
                    email: orderData.email.trim(),
                    phone: orderData.phone.trim().replace(/\s+/g, ''),
                    address: orderData.address.trim(),
                    city: orderData.city.trim(),
                    notes: orderData.notes.trim()
                },

                items: orderItems,
                itemsCount: orderItems.length,
                totalAmount: totalAmount,
                currency: 'EGP',

                status: 'pending',
                paymentStatus: 'pending',
                paymentMethod: 'cash_on_delivery',

                orderDate: serverTimestamp(),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),

                source: 'web_app',
                version: '1.0'
            };

            console.log('Final order data:', orderPayload);

            const docRef = await addDoc(collection(db, 'orders'), orderPayload);
            console.log('Order created with ID:', docRef.id);

            await updateDoc(doc(db, 'orders', docRef.id), {
                orderNumber: docRef.id,
                updatedAt: serverTimestamp()
            });

            await updateStock(refreshedItems);

            clearCart();
            console.log('Cart cleared');

            console.log('Order completed successfully!');
            router.push(`/order-success?orderId=${docRef.id}`);

        } catch (error: any) {
            console.error('Order creation error:', error);

            let errorMessage = 'An unexpected error occurred';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                errorMessage = `Database error: ${error.code}`;
            }

            alert(`Order submission failed:\n\n${errorMessage}\n\nPlease try again or contact customer service`);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.loadingIcon} />
                <h2>Verifying login status...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.authContainer}>
                <Lock className={styles.authIcon} />
                <h1>Login Required</h1>
                <p>Please login first to complete your purchase</p>
                <button
                    onClick={() => router.push('/auth/login')}
                    className={styles.loginBtn}
                >
                    <User className={styles.buttonIcon} />
                    Login Now
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <ShoppingBag className={styles.emptyIcon} />
                <h1>Cart is Empty</h1>
                <p>Cannot complete order without products</p>
                <button
                    onClick={() => router.push('/products')}
                    className={styles.shopBtn}
                >
                    <Eye className={styles.buttonIcon} />
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ShoppingBag className={styles.headerIcon} />
                <h1 className={styles.title}>Complete Your Order</h1>
                <p className={styles.subtitle}>Review your details before confirming</p>
            </div>

            {!cartValidation.valid && (
                <div className={styles.errorContainer}>
                    <div className={styles.errorHeader}>
                        <AlertTriangle className={styles.errorIcon} />
                        <h3>Cart Issues That Need Attention:</h3>
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
                            <Package className={styles.buttonIcon} />
                            Fix Cart
                        </button>
                        <button
                            onClick={() => router.push('/products')}
                            className={styles.continueShoppingBtn}
                        >
                            <ShoppingBag className={styles.buttonIcon} />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.infoBox}>
                <ShieldCheck className={styles.infoIcon} />
                <h3 className={styles.infoTitle}>Important Information:</h3>
                <ul className={styles.infoList}>
                    <li><CheckCircle className={styles.listIcon} /> Product availability will be verified automatically</li>
                    <li><Package className={styles.listIcon} /> Products will be reserved upon order confirmation</li>
                    <li><Truck className={styles.listIcon} /> Delivery within 3-7 business days</li>
                    <li><CreditCard className={styles.listIcon} /> Cash on delivery payment</li>
                    <li><Phone className={styles.listIcon} /> We will contact you to confirm your order</li>
                </ul>
            </div>

            <div className={styles.orderSummary}>
                <h2 className={styles.summaryTitle}>
                    <FileText className={styles.sectionIcon} />
                    Order Summary
                </h2>
                <div className={styles.summaryContent}>
                    {cartItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>
                                    {item.name || 'Name not available'}
                                    {(!item.name || item.name === 'Product name not available') && (
                                        <AlertTriangle className={styles.warningIcon} />
                                    )}
                                </span>
                                <span className={styles.itemQuantity}>× {item.quantity || 0}</span>
                            </div>
                            <span className={styles.itemPrice}>
                                {(item.price && item.quantity && !isNaN(item.price * item.quantity))
                                    ? (item.price * item.quantity).toFixed(2)
                                    : '0.00'
                                } EGP
                            </span>
                        </div>
                    ))}

                    <div className={styles.summaryDivider}></div>

                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>
                            <CreditCard className={styles.totalIcon} />
                            Total Amount:
                        </span>
                        <span className={styles.totalAmount}>
                            {(getTotalPrice() && !isNaN(getTotalPrice()))
                                ? getTotalPrice().toFixed(2)
                                : '0.00'
                            } EGP
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                <h2 className={styles.formTitle}>
                    <MapPin className={styles.sectionIcon} />
                    Delivery Information
                </h2>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName" className={styles.formLabel}>
                            <User className={styles.labelIcon} />
                            Full Name *
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={orderData.fullName}
                            onChange={(e) => setOrderData({ ...orderData, fullName: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="Enter your full name"
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            <Mail className={styles.labelIcon} />
                            Email Address *
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
                            <Phone className={styles.labelIcon} />
                            Phone Number *
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
                            <Building className={styles.labelIcon} />
                            City *
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={orderData.city}
                            onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                            required
                            className={styles.formInput}
                            placeholder="Cairo, Alexandria, Giza..."
                            maxLength={50}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="address" className={styles.formLabel}>
                            <MapPin className={styles.labelIcon} />
                            Detailed Address *
                        </label>
                        <textarea
                            id="address"
                            value={orderData.address}
                            onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                            required
                            className={styles.formTextarea}
                            placeholder="Enter your detailed address including street number and area..."
                            maxLength={300}
                            rows={3}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.formLabel}>
                            <FileText className={styles.labelIcon} />
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            value={orderData.notes}
                            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                            placeholder="Any special notes about your order or delivery..."
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
                            <>
                                <RefreshCw className={styles.loadingButtonIcon} />
                                Verifying and Processing Order...
                            </>
                        ) : cartValidation.valid ? (
                            <>
                                <CheckCircle className={styles.buttonIcon} />
                                Confirm Order ({(getTotalPrice() && !isNaN(getTotalPrice())) ? getTotalPrice().toFixed(2) : '0.00'} EGP)
                            </>
                        ) : (
                            <>
                                <AlertTriangle className={styles.buttonIcon} />
                                Please Fix Cart Issues First
                            </>
                        )}
                    </button>

                    {cartValidation.valid && (
                        <p className={styles.submitNote}>
                            <ShieldCheck className={styles.noteIcon} />
                            By clicking "Confirm Order" you agree to our terms of service
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}