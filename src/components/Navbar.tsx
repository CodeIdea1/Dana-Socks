'use client';
// components/Navbar.tsx
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const { cartItems, wishlistItems } = useCart();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    متجر الشرابات
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/products">المنتجات</Link>
                    <Link href="/cart" className={styles.cartLink}>
                        السلة ({cartItems.length})
                    </Link>
                    <Link href="/wishlist" className={styles.wishlistLink}>
                        المفضلة ({wishlistItems.length})
                    </Link>

                    {user ? (
                        <div className={styles.userMenu}>
                            <Link href="/profile">حسابي</Link>
                            <button onClick={handleSignOut} className={styles.signOutBtn}>
                                تسجيل الخروج
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authLinks}>
                            <Link href="/auth/login">تسجيل الدخول</Link>
                            <Link href="/auth/register">إنشاء حساب</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}