'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/products');
        } catch (error: any) {
            setError('Invalid email or password');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Image Section */}
            <div className={styles.imageSection}>
                <div className={styles.imageContainer}>
                    <img src="/socks/8.jpeg" alt="Garden Expert" />
                    <div className={styles.imageContent}>
                        <h2 className={`${styles.title} title`}>Welcome Back</h2>
                        <p>Sign in to access your plant collection and expert gardening tips</p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className={styles.formSection}>
                <div className={styles.formContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Dana Socks</h1>
                        <h2 className={styles.subtitle}>Sign In to Your Account</h2>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

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
                                disabled={loading}
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.links}>
                        <p>
                            Don't have an account?{' '}
                            <Link href="/auth/register">Create New Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}