'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import {
    Facebook,
    Instagram,
    ChevronLeft,
    ChevronRight,
    Search,
    User,
    ShoppingCart,
    Heart,
    UserCheck,
    LogOut
} from 'lucide-react';
import styles from './navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const { cartItems, wishlistItems } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const announcements = [
        "NEW ARRIVALS JUST LANDED",
        "FREE SHIPPING ON ORDERS OVER $50",
        "LIMITED TIME OFFER - 20% OFF",
        "PREMIUM QUALITY SOCKS COLLECTION"
    ];

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % announcements.length);
            setTimeout(() => {
                setIsAnimating(false);
            }, 150);
        }, 150);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
            setTimeout(() => {
                setIsAnimating(false);
            }, 150);
        }, 150);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className={styles.navbar}>
            <div className={styles.topBar}>
                <div className={styles.container}>
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <Facebook size={20} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <Instagram size={20} />
                        </a>
                    </div>

                    <div className={styles.announcementSlider}>
                        <button
                            className={styles.sliderBtn}
                            onClick={prevSlide}
                            aria-label="Previous announcement"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className={styles.announcementContainer}>
                            <div
                                className={`${styles.announcementText} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}
                            >
                                {announcements[currentSlide]}
                            </div>
                        </div>

                        <button
                            className={styles.sliderBtn}
                            onClick={nextSlide}
                            aria-label="Next announcement"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.spacer}></div>
                </div>
            </div>

            <div className={styles.mainNav}>
                <div className={styles.container}>
                    <div className={styles.leftNav}>
                        <Link href="/" className={styles.navLink}>Home</Link>
                        <Link href="/products" className={styles.navLink}>Catalog</Link>
                        <Link href="/contactus" className={styles.navLink}>Contact Us</Link>
                    </div>

                    <div className={`${styles.brand} title`}>
                        <Link href="/">Dana Socks</Link>
                    </div>

                    <div className={styles.rightNav}>
                        <button className={styles.iconBtn} aria-label="Search">
                            <Search size={20} />
                        </button>

                        {user ? (
                            <div className={styles.userDropdown}>
                                <button className={styles.iconBtn} aria-label="Account">
                                    <UserCheck size={20} />
                                </button>
                                <div className={styles.dropdownMenu}>
                                    <Link href="/profile">My Account</Link>
                                    <button onClick={handleSignOut}>
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth/login" className={styles.iconBtn} aria-label="Login">
                                <User size={20} />
                            </Link>
                        )}

                        <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                            <div className={styles.iconWithBadge}>
                                <ShoppingCart size={20} />
                                {cartItems.length > 0 && (
                                    <span className={styles.badge}>{cartItems.length}</span>
                                )}
                            </div>
                        </Link>

                        <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                            <div className={styles.iconWithBadge}>
                                <Heart size={20} />
                                {wishlistItems.length > 0 && (
                                    <span className={styles.badge}>{wishlistItems.length}</span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}