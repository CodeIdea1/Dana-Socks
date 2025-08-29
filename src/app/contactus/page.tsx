'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import styles from './ContactPage.module.css';
import Footer from '@/components/Footer';

// إضافة هذه الدالة المساعدة
const createCustomStyle = (customProps: Record<string, string>) => {
    return customProps as React.CSSProperties;
};

export default function ContactPage() {
    const router = useRouter();
    
    const handleGoBack = () => {
        router.back();
    };
    
    const contactMethods = [
        {
            icon: Phone,
            title: 'Call Us',
            subtitle: 'Mon-Fri from 8am to 5pm',
            value: '+20 123 456 7890',
            link: 'tel:+201234567890',
            color: '#10B981'
        },
        {
            icon: Mail,
            title: 'Email Us',
            subtitle: 'We reply within 24 hours',
            value: 'info@danasocks.com',
            link: 'mailto:info@danasocks.com',
            color: '#3B82F6'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            subtitle: 'Come say hello at our office',
            value: 'Cairo, Egypt',
            link: 'https://maps.google.com',
            color: '#F59E0B'
        }
    ];
       
    return (
        <>
            <div className={styles.container}>
                <div className={styles.backgroundElements}>
                    <div className={styles.floatingShape2}></div>
                    <div className={styles.floatingShape3}></div>
                </div>
                 
                <button onClick={handleGoBack} className={styles.backButton}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                 
                <div className={styles.pageHeader}>
                    <h1 className={`${styles.title} title`}>Contact Us</h1>
                    <p>We're here to answer all your questions and help you find the perfect socks for every occasion</p>
                </div>
                 
                <div className={styles.quickContact}>
                    {contactMethods.map((method, index) => (
                        <div 
                            key={index} 
                            className={styles.contactCard} 
                            style={createCustomStyle({ '--accent-color': method.color })}
                        >
                            <div className={styles.contactIcon}>
                                <method.icon size={28} />
                            </div>
                            <div className={styles.contactContent}>
                                <h3 className={`${styles.title} title`}>{method.title}</h3>
                                <p className={styles.contactSubValue}>{method.value}</p>
                                <span className={styles.contactSubtitle}>{method.subtitle}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}