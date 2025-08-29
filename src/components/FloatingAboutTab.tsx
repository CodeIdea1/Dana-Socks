'use client';

import { useState } from 'react';
import { User, Star, Package } from 'lucide-react';
import styles from './floating-about-tab.module.css';

export default function FloatingAboutTab() {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTab = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`${styles.floatingTab} ${isExpanded ? styles.expanded : styles.collapsed}`}>
            <div className={styles.tabHandle} onClick={toggleTab}>
                <span className={`${styles.aboutText} title`}>ABOUT</span>
            </div>

            <div className={styles.tabContent}>
                <div className={styles.contentInner}>
                    <div className={styles.header}>
                        <Star className={styles.starIcon} size={16} />
                        <span className={styles.rating}>5 Star (100+ reviews)</span>
                    </div>

                    <div className={styles.quote}>
                        "Hello, I'm Jana, a 12-year-old, accessory designer and the creative mind behind Dana Socks. With two years of experience, I've dedicated myself to crafting beautiful, unique socks that bring joy and sparkle to people of all ages."
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>100+</span>
                            <span className={styles.statLabel}>Positive Reviews Received</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Custom Orders Made</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}