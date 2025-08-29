'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    LogOut,
    Menu,
    X,
    Home,
    Package,
    Phone
} from 'lucide-react';
import styles from './navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const { cartItems, wishlistItems } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search functionality states
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const announcements = [
        "NEW ARRIVALS JUST LANDED",
        "FREE SHIPPING ON ORDERS OVER $50",
        "LIMITED TIME OFFER - 20% OFF",
        "PREMIUM QUALITY SOCKS COLLECTION"
    ];

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Search functionality
    const openSearch = () => {
        setIsSearchOpen(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const searchProducts = useCallback(async (searchTerm: string) => {
        if (!searchTerm.trim() || searchTerm.length < 1) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            // Search for products that start with the search term
            const searchTermLower = searchTerm.toLowerCase();
            const productsRef = collection(db, 'products');

            // Get all products and filter client-side for better search
            const snapshot = await getDocs(query(productsRef, limit(50)));

            const results = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const productName = (data.name || '').toLowerCase();

                if (productName.includes(searchTermLower) && data.stock > 0) {
                    results.push({
                        id: doc.id,
                        name: data.name,
                        price: data.price,
                        imageUrl: data.imageUrl || data.image,
                        category: data.category
                    });
                }
            });

            // Sort by relevance (exact matches first, then starts with, then contains)
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();

                if (aName === searchTermLower) return -1;
                if (bName === searchTermLower) return 1;
                if (aName.startsWith(searchTermLower) && !bName.startsWith(searchTermLower)) return -1;
                if (bName.startsWith(searchTermLower) && !aName.startsWith(searchTermLower)) return 1;

                return 0;
            });

            setSearchResults(results.slice(0, 8)); // Limit to 8 results
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle search input change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchProducts(searchQuery);
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchProducts]);

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                closeSearch();
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen]);

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

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);

            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            const timeout = setTimeout(() => {
                setIsVisible(true);
            }, 150);

            setScrollTimeout(timeout);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [lastScrollY, scrollTimeout]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest(`.${styles.mobileMenuContainer}`)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <nav className={`${styles.navbar} ${isVisible ? styles.visible : styles.hidden}`}>
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
                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle Menu"
                        style={{ display: isSearchOpen ? 'none' : 'block' }}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Navigation */}
                    <div className={`${styles.leftNav} ${isSearchOpen ? styles.hidden : ''}`}>
                        <Link href="/" className={styles.navLink}>Home</Link>
                        <Link href="/products" className={styles.navLink}>Catalog</Link>
                        <Link href="/contactus" className={styles.navLink}>Contact Us</Link>
                    </div>

                    {/* Brand */}
                    <div className={`${styles.brand} title ${isSearchOpen ? styles.hidden : ''}`}>
                        <Link href="/">Dana Socks</Link>
                    </div>

                    {/* Search Container */}
                    <div
                        ref={searchContainerRef}
                        className={`${styles.searchContainer} ${isSearchOpen ? styles.searchActive : ''}`}
                    >
                        {!isSearchOpen ? (
                            <button
                                className={styles.iconBtn}
                                aria-label="Search"
                                onClick={openSearch}
                            >
                                <Search size={20} />
                            </button>
                        ) : (
                            <>
                                <div className={styles.searchInputContainer}>
                                    <Search size={20} className={styles.searchIcon} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                    <button
                                        className={styles.closeSearchBtn}
                                        onClick={closeSearch}
                                        aria-label="Close search"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Search Results Dropdown */}
                                {(searchQuery.trim() && (searchResults.length > 0 || isSearching)) && (
                                    <div className={styles.searchDropdown}>
                                        {isSearching ? (
                                            <div className={styles.searchLoading}>
                                                <div className={styles.loadingSpinner}></div>
                                                <span>Searching...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/products/${product.id}`}
                                                        className={styles.searchResultItem}
                                                        onClick={closeSearch}
                                                    >
                                                        <div className={styles.resultImage}>
                                                            <img
                                                                src={product.imageUrl || '/placeholder.jpg'}
                                                                alt={product.name}
                                                                onError={(e) => {
                                                                    e.target.src = '/placeholder.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className={styles.resultInfo}>
                                                            <div className={styles.resultName}>{product.name}</div>
                                                            <div className={styles.resultPrice}>
                                                                {new Intl.NumberFormat('en-EG').format(product.price)} LE
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}

                                                {searchResults.length === 0 && (
                                                    <div className={styles.noResults}>
                                                        <span>No products found for "{searchQuery}"</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Navigation */}
                    <div className={`${styles.rightNav} ${isSearchOpen ? styles.hidden : ''}`}>
                        {user ? (
                            <div className={styles.userDropdown}>
                                <button className={styles.iconBtn} aria-label="Account">
                                    <UserCheck size={20} />
                                </button>
                                <div className={styles.dropdownMenu}>
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

                    {/* Mobile Actions (Cart & Wishlist only) */}
                    <div className={`${styles.mobileActions} ${isSearchOpen ? styles.hidden : ''}`}>
                        <Link href="/cart" className={styles.mobileIconBtn} aria-label="Cart">
                            <div className={styles.iconWithBadge}>
                                <ShoppingCart size={22} />
                                {cartItems.length > 0 && (
                                    <span className={styles.badge}>{cartItems.length}</span>
                                )}
                            </div>
                        </Link>

                        <Link href="/wishlist" className={styles.mobileIconBtn} aria-label="Wishlist">
                            <div className={styles.iconWithBadge}>
                                <Heart size={22} />
                                {wishlistItems.length > 0 && (
                                    <span className={styles.badge}>{wishlistItems.length}</span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />}

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileMenuContainer}>
                    <div className={`${styles.mobileMenuHeader} title`}>
                        <h3>Menu</h3>
                        <button onClick={closeMobileMenu} className={styles.closeMobileMenu}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.mobileMenuContent}>
                        <Link href="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <Home size={20} />
                            <span>Home</span>
                        </Link>

                        <Link href="/products" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <Package size={20} />
                            <span>Catalog</span>
                        </Link>

                        <Link href="/contactus" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <Phone size={20} />
                            <span>Contact Us</span>
                        </Link>

                        <div className={styles.mobileDivider}></div>

                        <button className={styles.mobileNavLink} onClick={() => { closeMobileMenu(); openSearch(); }}>
                            <Search size={20} />
                            <span>Search</span>
                        </button>

                        {user ? (
                            <button onClick={handleSignOut} className={styles.mobileNavLink}>
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <Link href="/auth/login" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                                <User size={20} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    <div className={styles.mobileMenuFooter}>
                        <div className={styles.mobileSocialLinks}>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                <Facebook size={24} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <Instagram size={24} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}