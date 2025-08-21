'use client';
// app/auth/register/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/lib/firebase';
import styles from './register.module.css';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(''); // لتتبع المشكلة
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setDebugInfo('بدء عملية التسجيل...');

        // التحقق من صحة البيانات
        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            setDebugInfo('');
            return;
        }

        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            setDebugInfo('');
            return;
        }

        setLoading(true);

        try {
            setDebugInfo('جاري التحقق من Firebase...');

            // التحقق من وجود Firebase
            if (!auth) {
                throw new Error('Firebase Auth غير مُعرَّف');
            }

            setDebugInfo('جاري إنشاء المستخدم...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            setDebugInfo('جاري حفظ بيانات المستخدم...');

            // محاولة حفظ البيانات في Firestore (اختياري)
            try {
                if (db) {
                    await setDoc(doc(db, 'users', user.uid), {
                        email: user.email,
                        createdAt: new Date().toISOString(),
                    });
                    setDebugInfo('تم حفظ البيانات في Firestore بنجاح');
                }
            } catch (firestoreError) {
                console.warn('Failed to save to Firestore, but user account created:', firestoreError);
                setDebugInfo('تم إنشاء الحساب بنجاح (بدون حفظ في قاعدة البيانات)');
            }

            // النجاح - التوجه إلى صفحة المنتجات
            setDebugInfo('تم إنشاء الحساب بنجاح! جاري التحويل...');

            // تأخير قصير لإظهار رسالة النجاح
            setTimeout(() => {
                router.push('/products');
            }, 1000);

        } catch (err) {
            let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';

            console.error('Registration error details:', err);
            setDebugInfo(`خطأ: ${err}`);

            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'البريد الإلكتروني غير صحيح';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'كلمة المرور ضعيفة جداً';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'مشكلة في الاتصال بالإنترنت';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'تم تجاوز حد المحاولات، حاول لاحقاً';
                        break;
                    default:
                        errorMessage = `خطأ Firebase: ${err.code}`;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>إنشاء حساب جديد</h1>

                {error && <div className={styles.error}>{error}</div>}

                {debugInfo && (
                    <div className={styles.debug}>
                        🔍 {debugInfo}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">البريد الإلكتروني</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">كلمة المرور (6 أحرف على الأقل)</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                    </button>
                </form>

                <div className={styles.links}>
                    <p>
                        لديك حساب بالفعل؟{' '}
                        <Link href="/auth/login">تسجيل الدخول</Link>
                    </p>
                </div>

                {/* رسالة مساعدة */}
                <div className={styles.helpText}>
                    <p>💡 تأكد من:</p>
                    <ul>
                        <li>الاتصال بالإنترنت</li>
                        <li>إعداد Firebase بشكل صحيح</li>
                        <li>تفعيل Email Authentication في Firebase</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}