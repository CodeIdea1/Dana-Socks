'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import ToastNotification, { ToastProps } from '@/components/ToastNotification';

interface ToastContextType {
    showToast: (type: ToastProps['type'], productName?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<{
        isVisible: boolean;
        type: ToastProps['type'];
        productName?: string;
    }>({
        isVisible: false,
        type: 'cart-added',
        productName: ''
    });

    const showToast = (type: ToastProps['type'], productName?: string) => {
        setToast({
            isVisible: true,
            type,
            productName
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastNotification
                type={toast.type}
                productName={toast.productName}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};