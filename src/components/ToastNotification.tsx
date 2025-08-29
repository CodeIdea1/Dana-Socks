import React, { useEffect } from 'react';
import { Check, ShoppingCart, Heart, X } from 'lucide-react';
import styles from './ToastNotification.module.css';

export interface ToastProps {
    type: 'cart-added' | 'cart-removed' | 'wishlist-added' | 'wishlist-removed';
    productName?: string;
    isVisible: boolean;
    onClose: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({
    type,
    productName,
    isVisible,
    onClose
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // يختفي بعد 3 ثواني

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const getToastConfig = () => {
        switch (type) {
            case 'cart-added':
                return {
                    icon: <ShoppingCart size={20} />,
                    title: 'Added to Cart',
                    message: `${productName || 'Product'} has been added to your cart`,
                    bgColor: 'success'
                };
            case 'cart-removed':
                return {
                    icon: <X size={20} />,
                    title: 'Removed from Cart',
                    message: `${productName || 'Product'} has been removed from your cart`,
                    bgColor: 'warning'
                };
            case 'wishlist-added':
                return {
                    icon: <Heart size={20} />,
                    title: 'Added to Wishlist',
                    message: `${productName || 'Product'} has been added to your wishlist`,
                    bgColor: 'success'
                };
            case 'wishlist-removed':
                return {
                    icon: <Heart size={20} />,
                    title: 'Removed from Wishlist',
                    message: `${productName || 'Product'} has been removed from your wishlist`,
                    bgColor: 'warning'
                };
            default:
                return {
                    icon: <Check size={20} />,
                    title: 'Success',
                    message: 'Action completed successfully',
                    bgColor: 'success'
                };
        }
    };

    if (!isVisible) return null;

    const config = getToastConfig();

    return (
        <div className={`${styles.toast} ${styles[config.bgColor]} ${isVisible ? styles.show : ''}`}>
            <div className={styles.toastContent}>
                <div className={styles.iconContainer}>
                    {config.icon}
                </div>
                <div className={styles.textContent}>
                    <div className={styles.title}>{config.title}</div>
                    <div className={styles.message}>{config.message}</div>
                </div>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close notification"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;