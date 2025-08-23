'use client';

// components/Navbar.tsx
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import styles from './navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const { cartItems, wishlistItems } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Announcement messages
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

    // Auto-rotate announcements every 4 seconds
    useEffect(() => {
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className={styles.navbar}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.container}>
                    {/* Social Icons */}
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                    </div>

                    {/* Announcement Slider */}
                    <div className={styles.announcementSlider}>
                        <button
                            className={styles.sliderBtn}
                            onClick={prevSlide}
                            aria-label="Previous announcement"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.spacer}></div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className={styles.mainNav}>
                <div className={styles.container}>
                    {/* Left Navigation */}
                    <div className={styles.leftNav}>
                        <Link href="/" className={styles.navLink}>الرئيسية</Link>
                        <Link href="/products" className={styles.navLink}>الكتالوج</Link>
                        <Link href="/contact" className={styles.navLink}>اتصل بنا</Link>
                    </div>

                    {/* Brand Logo */}
                    <div className={`${styles.brand} title`}>
                        <Link href="/">Dana Socks</Link>
                    </div>

                    {/* Right Navigation */}
                    <div className={styles.rightNav}>
                        {/* Search Icon */}
                        <button className={styles.iconBtn} aria-label="Search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>

                        {/* User Account Icon */}
                        {user ? (
                            <div className={styles.userDropdown}>
                                <button className={styles.iconBtn} aria-label="Account">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m9 12 2 2 4-4"></path>
                                        <path d="M20.1 14.1a5 5 0 1 1-8.2 0l8.2 0z"></path>
                                        <circle cx="12" cy="6" r="3"></circle>
                                    </svg>
                                </button>
                                <div className={styles.dropdownMenu}>
                                    <Link href="/profile">حسابي</Link>
                                    <button onClick={handleSignOut}>تسجيل الخروج</button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth/login" className={styles.iconBtn} aria-label="Login">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                            <div className={styles.iconWithBadge}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                </svg>
                                {cartItems.length > 0 && (
                                    <span className={styles.badge}>{cartItems.length}</span>
                                )}
                            </div>
                        </Link>

                        {/* Wishlist Icon */}
                        <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                            <div className={styles.iconWithBadge}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
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