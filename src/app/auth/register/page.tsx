'use client';

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
    const [debugInfo, setDebugInfo] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setDebugInfo('Starting registration process...');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setDebugInfo('');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setDebugInfo('');
            return;
        }

        setLoading(true);

        try {
            setDebugInfo('Checking Firebase...');

            if (!auth) {
                throw new Error('Firebase Auth is not defined');
            }

            setDebugInfo('Creating user...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            setDebugInfo('Saving user data...');

            try {
                if (db) {
                    await setDoc(doc(db, 'users', user.uid), {
                        email: user.email,
                        createdAt: new Date().toISOString(),
                    });
                    setDebugInfo('Data saved to Firestore successfully');
                }
            } catch (firestoreError) {
                console.warn('Failed to save to Firestore, but user account created:', firestoreError);
                setDebugInfo('Account created successfully (without saving to database)');
            }

            setDebugInfo('Account created successfully! Redirecting...');

            setTimeout(() => {
                router.push('/products');
            }, 1000);

        } catch (err) {
            let errorMessage = 'An error occurred while creating the account';

            console.error('Registration error details:', err);
            setDebugInfo(`Error: ${err}`);

            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already in use';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network connection problem';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many attempts, try again later';
                        break;
                    default:
                        errorMessage = `Firebase error: ${err.code}`;
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
            {/* Image Section */}
            <div className={styles.imageSection}>
                <div className={styles.imageContainer}>
                    <img src="/socks/4.png" alt="Plant Specialist" />

                </div>
            </div>

            {/* Form Section */}
            <div className={styles.formSection}>
                <div className={styles.formContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Dana Socks</h1>
                        <h2 className={styles.subtitle}>Create New Account</h2>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    {debugInfo && (
                        <div className={styles.debug}>
                            🔍 {debugInfo}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                                disabled={loading}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={styles.input}
                                minLength={6}
                                disabled={loading}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={styles.input}
                                disabled={loading}
                                placeholder="Confirm your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className={styles.links}>
                        <p>
                            Already have an account?{' '}
                            <Link href="/auth/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}