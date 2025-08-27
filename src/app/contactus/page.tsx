'use client';
import { useRouter } from 'next/navigation';
import ContactSection from '@/components/ContactSection';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import styles from './ContactPage.module.css';

export default function ContactPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleContactSuccess = () => {
        console.log('Contact form submitted successfully from contact page');
    };

    return (
        <div className={styles.container}>
            <button onClick={handleGoBack} className={styles.backButton}>
                <ArrowLeft size={20} />
                Back
            </button>

            <div className={styles.pageHeader}>
                <h1>Contact Us</h1>
                <p>We're here to answer all your questions and help you</p>
            </div>

            <div className={styles.quickContact}>
                <div className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <Phone size={24} />
                    </div>
                    <h3>Call Us</h3>
                    <p>+20 123 456 7890</p>
                </div>

                <div className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <Mail size={24} />
                    </div>
                    <h3>Email Us</h3>
                    <p>info@company.com</p>
                </div>

                <div className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <MapPin size={24} />
                    </div>
                    <h3>Visit Us</h3>
                    <p>Cairo, Egypt</p>
                </div>
            </div>

            <div className={styles.formWrapper}>
                <ContactSection
                    showBackButton={false}
                    onSuccess={handleContactSuccess}
                />
            </div>
        </div>
    );
}