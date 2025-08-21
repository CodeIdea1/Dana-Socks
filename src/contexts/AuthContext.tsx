'use client';
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    userEmail: string | null;
    userId: string | null;
    refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    userEmail: null,
    userId: null,
    refreshAuth: () => { },
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // دالة لتحديث حالة المصادقة يدوياً
    const refreshAuth = () => {
        setLoading(true);
        setError(null);

        // إعادة فحص حالة المصادقة
        const currentUser = auth.currentUser;
        setUser(currentUser);
        setLoading(false);
    };

    useEffect(() => {
        let unsubscribe: () => void;

        try {
            // التحقق من توفر Firebase Auth
            if (!auth) {
                throw new Error('Firebase Auth is not initialized');
            }

            unsubscribe = onAuthStateChanged(
                auth,
                (user) => {
                    try {
                        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');

                        // التحقق من صحة بيانات المستخدم
                        if (user) {
                            // التأكد من أن المستخدم لديه UID صحيح
                            if (!user.uid) {
                                console.error('User object is missing UID');
                                setError('خطأ في بيانات المستخدم');
                                setUser(null);
                                setLoading(false);
                                return;
                            }

                            // التحقق من تفعيل البريد الإلكتروني (اختيارية)
                            // if (!user.emailVerified && user.email) {
                            //     console.warn('User email is not verified');
                            // }
                        }

                        setUser(user);
                        setError(null);
                        setLoading(false);
                    } catch (authError) {
                        console.error('Error in auth state change:', authError);
                        setError('خطأ في تحديث حالة المصادقة');
                        setUser(null);
                        setLoading(false);
                    }
                },
                (authError) => {
                    // معالجة أخطاء Firebase Auth
                    console.error('Firebase Auth Error:', authError);
                    setError('خطأ في الاتصال بخدمة المصادقة');
                    setUser(null);
                    setLoading(false);
                }
            );

        } catch (initError) {
            console.error('Error initializing Auth listener:', initError);
            setError('خطأ في تهيئة نظام المصادقة');
            setLoading(false);
        }

        // دالة التنظيف
        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (cleanupError) {
                    console.error('Error during auth cleanup:', cleanupError);
                }
            }
        };
    }, []);

    // إعادة المحاولة في حالة الخطأ
    useEffect(() => {
        if (error && !loading) {
            // إعادة المحاولة بعد 5 ثواني في حالة الخطأ
            const retryTimer = setTimeout(() => {
                console.log('Retrying auth initialization...');
                refreshAuth();
            }, 5000);

            return () => clearTimeout(retryTimer);
        }
    }, [error, loading]);

    // قيم محسوبة لسهولة الاستخدام
    const isAuthenticated = !!user;
    const userEmail = user?.email || null;
    const userId = user?.uid || null;

    // في حالة خطأ Firebase
    if (error && !loading) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#fee',
                border: '1px solid #f00',
                margin: '20px',
                borderRadius: '5px'
            }}>
                <h3 style={{ color: '#d00' }}>خطأ في نظام المصادقة</h3>
                <p>{error}</p>
                <button
                    onClick={refreshAuth}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const contextValue: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated,
        userEmail,
        userId,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};