'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import styles from './SockShowcase.module.css';

interface ShowcaseItem {
    id: number;
    title: string;
    subtitle: string;
    image: string;
}

const showcaseData: ShowcaseItem[] = [
    {
        id: 1,
        title: 'PREMIUM QUALITY',
        subtitle: 'High-quality materials for ultimate comfort and durability.',
        image: '/socks/1.png'
    },
    {
        id: 2,
        title: 'STYLISH DESIGNS',
        subtitle: 'Trendy patterns and colors to match your unique style.',
        image: '/socks/2.png'
    },
    {
        id: 3,
        title: 'COMFORT FIT',
        subtitle: 'Ergonomic design for all-day comfort and support.',
        image: '/socks/3.png'
    },
    {
        id: 4,
        title: 'SEASONAL COLLECTION',
        subtitle: 'Special collections for every season and occasion.',
        image: '/socks/4.png'
    },
    {
        id: 5,
        title: 'GIFT SETS',
        subtitle: 'Perfect gift packages for your loved ones.',
        image: '/socks/1899ceaf-065f-44b9-9be8-5504d520f5d6.jpeg'
    }
];

export default function SockShowcase() {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [closingItem, setClosingItem] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const handleMouseEnter = (index: number) => {
        if (!isMobile) {
            setSelectedIndex(index);
        }
    };

    const handleItemClick = (index: number) => {
        if (isMobile) {
            if (expandedItem === index) {
                // Start closing animation
                setClosingItem(index);
                setTimeout(() => {
                    setExpandedItem(null);
                    setClosingItem(null);
                }, 400); // Match animation duration
            } else {
                // Close current item smoothly before opening new one
                if (expandedItem !== null) {
                    setClosingItem(expandedItem);
                    setTimeout(() => {
                        setClosingItem(null);
                        setExpandedItem(index);
                    }, 400);
                } else {
                    setExpandedItem(index);
                }
            }
        }
    };

    const handleCloseImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (expandedItem !== null) {
            setClosingItem(expandedItem);
            setTimeout(() => {
                setExpandedItem(null);
                setClosingItem(null);
            }, 400);
        }
    };

    return (
        <section className={styles.showcase}>
            <div className={styles.container}>
                {!isMobile && (
                    <div className={styles.imageSection}>
                        <div className={styles.imageContainer}>
                            {showcaseData.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`${styles.imageWrapper} ${selectedIndex === index ? styles.active : ''}`}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className={styles.image}
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.menuSection}>
                    <div className={styles.menu}>
                        <h2 className={`${styles.mainTitle} title`}>
                            OUR SOCK COLLECTIONS
                        </h2>

                        <ul className={styles.menuList}>
                            {showcaseData.map((item, index) => (
                                <li
                                    key={item.id}
                                    className={`${styles.menuItem} ${!isMobile && selectedIndex === index ? styles.activeItem : ''} ${isMobile && expandedItem === index ? styles.expandedItem : ''}`}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onClick={() => handleItemClick(index)}
                                >
                                    <div className={styles.backgroundSlider} />

                                    <div className={styles.itemContent}>
                                        <span className={styles.itemTitle}>{item.title}</span>
                                        <span className={styles.itemSubtitle}>{item.subtitle}</span>
                                    </div>

                                    {isMobile && (
                                        <div className={`${styles.expandIcon} ${expandedItem === index ? styles.rotated : ''}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    )}

                                    {isMobile && (expandedItem === index || closingItem === index) && (
                                        <div
                                            className={`${styles.expandedImageContainer} ${closingItem === index ? styles.closing : ''}`}
                                            onClick={handleCloseImage}
                                        >
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                width={400}
                                                height={250}
                                                className={styles.expandedImage}
                                            />
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}