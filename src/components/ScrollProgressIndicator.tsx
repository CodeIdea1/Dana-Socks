'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './scroll-progress.module.css';

export default function ScrollProgressIndicator() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = (window.scrollY / totalHeight) * 100;

            setScrollProgress(currentProgress);
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return (
        <div
            className={`${styles.scrollProgress} ${isVisible ? styles.visible : styles.hidden}`}
            onClick={scrollToTop}
            role="button"
            tabIndex={0}
            aria-label="Scroll to top"
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToTop();
                }
            }}
        >
            <svg className={styles.progressRing} width="60" height="60">
                <circle
                    className={styles.progressRingBackground}
                    stroke="#e2e8f0"
                    strokeWidth="3"
                    fill="transparent"
                    r={radius}
                    cx="30"
                    cy="30"
                />
                <circle
                    className={styles.progressRingCircle}
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="transparent"
                    r={radius}
                    cx="30"
                    cy="30"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 30 30)"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3d74b6" />
                        <stop offset="100%" stopColor="orange;" />
                    </linearGradient>
                </defs>
            </svg>

            <div className={styles.iconContainer}>
                <ArrowUp size={20} />
            </div>

            <div className={styles.percentageText}>
                {Math.round(scrollProgress)}%
            </div>
        </div>
    );
}