// components/About.tsx
'use client'
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './about.module.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !titleRef.current || !imageRef.current) return;

        // النصوص المختلفة التي ستظهر تتابعياً
        const textSequences = [
            "Discover the perfect blend of luxury, durability, and innovation. With",
            "Premium quality materials meet cutting-edge design technology today",
            "Experience comfort like never before with our revolutionary products"
        ];

        // دالة لإنشاء الكلمات
        const createWords = (text: string) => {
            const words = text.split(' ');
            return words
                .map(word => `<span class="${styles.word}" style="opacity: 0; display: inline-block; margin-right: 0.3em;">${word}</span>`)
                .join(' ');
        };

        // إعدادات ثابتة لجميع الشاشات
        const sectionHeight = window.innerHeight * 4;
        const wordAnimationDuration = 0.1;
        const pauseBetweenTexts = 0.3;

        // إنشاء Timeline رئيسي
        const mainTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: `+=${sectionHeight}`,
                scrub: 1.4, // قيمة أصغر لجعل الأنيميشن أكثر سلاسة مع السكرول
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                refreshPriority: -1,
                invalidateOnRefresh: true,
            }
        });

        // أنيميشن دخول الصورة
        mainTimeline.fromTo(imageRef.current,
            {
                x: -400
            },
            {
                x: 0,
                duration: 1.3,
                ease: "power2.out"
            }
        );

        // دالة لإضافة أنيميشن نص واحد
        const addTextAnimation = (text: string, textIndex: number) => {
            const words = text.split(' ');

            // تحديث محتوى العنصر
            mainTimeline.call(() => {
                if (titleRef.current) {
                    titleRef.current.innerHTML = createWords(text);
                }
            });

            // الحصول على الكلمات وإظهارها واحدة تلو الأخرى
            words.forEach((word, wordIndex) => {
                mainTimeline.to({}, {
                    duration: wordAnimationDuration,
                    onStart: () => {
                        const wordElements = titleRef.current?.querySelectorAll(`.${styles.word}`);
                        if (wordElements && wordElements[wordIndex]) {
                            gsap.set(wordElements[wordIndex], { opacity: 1 });
                        }
                    },
                    onReverseComplete: () => {
                        const wordElements = titleRef.current?.querySelectorAll(`.${styles.word}`);
                        if (wordElements && wordElements[wordIndex]) {
                            gsap.set(wordElements[wordIndex], { opacity: 0 });
                        }
                    }
                });
            });

            // توقف بين النصوص
            mainTimeline.to({}, { duration: pauseBetweenTexts });

            // إخفاء النص (إلا الأخير) عند التقدم والإظهار عند الرجوع
            if (textIndex < textSequences.length - 1) {
                words.forEach((word, wordIndex) => {
                    mainTimeline.to({}, {
                        duration: wordAnimationDuration * 0.5,
                        onStart: () => {
                            const wordElements = titleRef.current?.querySelectorAll(`.${styles.word}`);
                            if (wordElements && wordElements[wordIndex]) {
                                gsap.set(wordElements[wordIndex], { opacity: 0 });
                            }
                        },
                        onReverseComplete: () => {
                            const wordElements = titleRef.current?.querySelectorAll(`.${styles.word}`);
                            if (wordElements && wordElements[wordIndex]) {
                                gsap.set(wordElements[wordIndex], { opacity: 1 });
                            }
                        }
                    });
                });

                // توقف إضافي بين النصوص
                mainTimeline.to({}, { duration: pauseBetweenTexts });
            }
        };

        // إضافة جميع النصوص
        textSequences.forEach((text, index) => {
            addTextAnimation(text, index);
        });

        return () => {
            mainTimeline.scrollTrigger?.kill();
            mainTimeline.kill();
        };


    }, []);

    return (
        <section ref={sectionRef} className={styles.AboutSection}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Right Content - Sock Image */}
                    <div className={styles.rightContent}>
                        <div className={styles.sockContainer}>
                            <div className={styles.sockImage}>
                                <img
                                    ref={imageRef}
                                    src="about.png"
                                    alt="Black sock with blue stripe"
                                    className={styles.sock}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.leftContent}>
                        <h2 ref={titleRef} className={`${styles.title} title`}>
                            {/* النص سيتم إدراجه ديناميكياً */}
                        </h2>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;