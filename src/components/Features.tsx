// components/Features.tsx
'use client'
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Features.module.css';

// تسجيل ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const annotation1Ref = useRef<HTMLDivElement>(null);
    const annotation2Ref = useRef<HTMLDivElement>(null);
    const annotation3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        // دالة لتحويل النص إلى حروف منفصلة
        const splitTextIntoChars = (element: HTMLElement) => {
            const text = element.textContent || '';
            element.innerHTML = '';

            return text.split('').map(char => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.opacity = '0';
                span.style.display = 'inline-block';
                element.appendChild(span);
                return span;
            });
        };

        // دالة انيميشن الكتابة
        const typewriterAnimation = (element: HTMLElement, delay: number = 0) => {
            // إظهار العنصر الأساسي أولاً
            gsap.set(element, { opacity: 1 });

            const chars = splitTextIntoChars(element);

            gsap.fromTo(chars,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.05,
                    stagger: 0.03,
                    delay: delay,
                    ease: "none"
                }
            );
        };

        // انيميشن منفصل لكل عنصر عند الوصول إليه

        // انيميشن العنوان
        ScrollTrigger.create({
            trigger: section.querySelector('.title'),
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(section.querySelector('.title'),
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
                );
            }
        });

        // انيميشن الوصف
        ScrollTrigger.create({
            trigger: section.querySelector(`.${styles.description}`),
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(section.querySelector(`.${styles.description}`),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
            }
        });

        // انيميشن الزر
        ScrollTrigger.create({
            trigger: section.querySelector(`.${styles.aboutButton}`),
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(section.querySelector(`.${styles.aboutButton}`),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );
            }
        });



        // انيميشن الصورة
        ScrollTrigger.create({
            trigger: section.querySelector(`.${styles.sock}`),
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(section.querySelector(`.${styles.sock}`),
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
                );
            }
        });

        // ScrollTrigger للانيميشن عند الوصول للسكشن
        ScrollTrigger.create({
            trigger: section,
            start: "top 70%",
            onEnter: () => {
                // تشغيل انيميشن الكتابة لكل annotation بتأخير مختلف
                setTimeout(() => {
                    if (annotation1Ref.current) {
                        typewriterAnimation(annotation1Ref.current, 0);
                    }
                }, 800);

                setTimeout(() => {
                    if (annotation2Ref.current) {
                        typewriterAnimation(annotation2Ref.current, 0);
                    }
                }, 1500);

                setTimeout(() => {
                    if (annotation3Ref.current) {
                        typewriterAnimation(annotation3Ref.current, 0);
                    }
                }, 2200);
            }
        });

        // تنظيف ScrollTrigger عند إلغاء التحميل
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className={styles.featuresSection}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Left Content */}
                    <div className={styles.leftContent}>
                        <h2 className={`${styles.title} title`}>
                            YOUR COMFORT<br />
                            IS OUR GOAL
                        </h2>

                        <p className={styles.description}>
                            Discover the perfect blend of luxury, durability, and innovation. With
                            Fila latest in performance running technology, targeted cushioning, and
                            advanced heel-seams & patterns our socks fit your every hanes and they put our
                            performance and comfort first.
                        </p>

                        <button className={styles.aboutButton}>
                            ABOUT OUR SOCKS
                        </button>


                    </div>

                    {/* Right Content - Sock Image */}
                    <div className={styles.rightContent}>
                        <div className={styles.sockContainer}>
                            <div className={styles.sockImage}>
                                {/* Sock Image */}
                                <img
                                    src="featuresImg.png"
                                    alt="Black sock with blue stripe"
                                    className={styles.sock}
                                />

                                {/* Feature Annotations */}
                                <div className={`${styles.annotation} ${styles.annotationOne}`}>
                                    <div
                                        ref={annotation1Ref}
                                        className={styles.annotationText}
                                    >
                                        Sock fabric that provides arch support and reduces slip and impact shock.
                                    </div>
                                </div>

                                <div className={`${styles.annotation} ${styles.annotationTwo}`}>
                                    <div
                                        ref={annotation2Ref}
                                        className={styles.annotationText}
                                    >
                                        Moisture-wicking fabric keeps feet cool and dry all day long.
                                    </div>
                                </div>

                                <div className={`${styles.annotation} ${styles.annotationThree}`}>
                                    <div
                                        ref={annotation3Ref}
                                        className={styles.annotationText}
                                    >
                                        Cushion absorbs shock when exercising and reduces MUSCLE FATIGUE
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default Features;