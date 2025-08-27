'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './HeroSection.module.css';
import { Gem, ShieldCheck, Award } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
}

const HeroSection = () => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const mainImageRef = useRef<HTMLImageElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // صور المنتجات
    const products: Product[] = [
        {
            id: 1,
            name: "Yellow Grey Basket Shoes",
            price: "$1000.00",
            image: "/heroImg1.png"
        },
        {
            id: 2,
            name: "Gray Orange Running Shoes",
            price: "$1000.00",
            image: "/heroImg2.png"
        },
        {
            id: 3,
            name: "Black Sport Shoes",
            price: "$950.00",
            image: "/heroImg1.png"
        }
    ];

    // التحقق من حجم الشاشة
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // التحقق عند التحميل
        checkIsMobile();

        // إضافة مستمع لتغير حجم النافذة
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    // تبديل الصورة الرئيسية
    const handleImageSelect = (index: number) => {
        setSelectedImageIndex(index);
    };

    // معالجة بدء اللمس
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        touchStartX.current = e.touches[0].clientX;
    };

    // معالجة نهاية اللمس
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isMobile) return;
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };

    // التعامل مع السحب
    const handleSwipe = () => {
        if (!isMobile) return;

        const minSwipeDistance = 50; // الحد الأدنى للمسافة لاعتبارها سحباً
        const distance = touchStartX.current - touchEndX.current;

        // السحب لليسار (التالي)
        if (distance > minSwipeDistance) {
            const nextIndex = (selectedImageIndex + 1) % products.length;
            setSelectedImageIndex(nextIndex);
        }
        // السحب لليمين (السابق)
        else if (distance < -minSwipeDistance) {
            const prevIndex = (selectedImageIndex - 1 + products.length) % products.length;
            setSelectedImageIndex(prevIndex);
        }
    };

    // حركة الصورة مع الماوس في الصفحة كاملة
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!mainImageRef.current) return;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // حساب المسافة من مركز الشاشة
            const moveX = (mouseX - centerX) * 0.015;
            const moveY = (mouseY - centerY) * 0.015;

            // تطبيق الحركة
            mainImageRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        };

        // إضافة مستمع الحدث للنافذة
        window.addEventListener('mousemove', handleGlobalMouseMove);

        // تنظيف المستمع عند إلغاء المكون
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []);

    // حركة إضافية عند الهوفر على الصورة نفسها
    const handleImageHover = () => {
        if (!mainImageRef.current) return;
        mainImageRef.current.style.transform += ' scale(1.05)';
    };

    const handleImageLeave = () => {
        if (!mainImageRef.current) return;
        const currentTransform = mainImageRef.current.style.transform;
        mainImageRef.current.style.transform = currentTransform.replace(' scale(1.05)', '');
    };

    // التمرير إلى قسم المنتجات
    const scrollToProducts = () => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <section className={styles.heroSection}>
            <div className={styles.container}>
                {/* النص الرئيسي */}
                <div className={styles.heroText}>
                    <h1 className={`${styles.heroTitle} title`}>
                        COMFORT REDEFINED.
                    </h1>
                    <p className={styles.description}>
                        Socks that redefine everyday comfort, merging unbeatable breathability with stylish design.
                    </p>
                    <button
                        className={styles.shopButton}
                        onClick={scrollToProducts}
                    >
                        Shop Now
                    </button>

                    {/* المميزات */}
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>
                                <Gem />
                            </span>
                            <span>100+ products</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>
                                <ShieldCheck />

                            </span>
                            <span>7D guarantee</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>
                                <Award />
                            </span>
                            <span>100% Original</span>
                        </div>
                    </div>
                </div>

                {/* قسم الصور */}
                <div className={styles.heroImages}>
                    {/* الصورة الرئيسية */}
                    <div
                        className={styles.mainImageContainer}
                        onMouseEnter={handleImageHover}
                        onMouseLeave={handleImageLeave}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            ref={mainImageRef}
                            src={products[selectedImageIndex].image}
                            alt={products[selectedImageIndex].name}
                            className={styles.mainImage}
                        />

                    </div>

                    {/* الصور المصغرة */}
                    <div className={styles.thumbnailsWithArrow}>
                        <div className={styles.thumbnailContainer}>
                            {products.slice(1).map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`${styles.thumbnail} ${selectedImageIndex === index + 1 ? styles.thumbnailActive : ''}`}
                                    onClick={() => handleImageSelect(index + 1)}
                                >
                                    <div className={styles.thumbnailImageContainer}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className={styles.thumbnailImage}
                                        />
                                    </div>
                                    <div className={styles.thumbnailInfo}>
                                        <h4 className={styles.thumbnailName}>{product.name}</h4>
                                        <p className={styles.thumbnailPrice}>{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* السهم */}
                        <button
                            className={styles.arrowButton}
                            onClick={scrollToProducts}
                            aria-label="Go to products"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5L15 12L8 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;