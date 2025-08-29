'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle, Loader2 } from 'lucide-react';
import styles from './ContactSection.module.css';

interface ContactForm {
    name: string;
    email: string;
    phoneNumber: string;
    comment: string;
}

interface ContactSectionProps {
    showBackButton?: boolean;
    onSuccess?: () => void;
}

export default function ContactSection({ showBackButton = false, onSuccess }: ContactSectionProps) {
    const [formData, setFormData] = useState<ContactForm>({
        name: '',
        email: '',
        phoneNumber: '',
        comment: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Partial<ContactForm>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<ContactForm> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be more than 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const phoneRegex = /^[0-9+\-\s]{10,15}$/;
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Phone number must be 10-15 digits';
        }

        if (!formData.comment.trim()) {
            newErrors.comment = 'Message is required';
        } else if (formData.comment.trim().length < 10) {
            newErrors.comment = 'Message must be more than 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof ContactForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'contacts'), {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                comment: formData.comment.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('Contact form submitted successfully');
            setSuccess(true);

            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                comment: ''
            });

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while sending the message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToForm = () => {
        setSuccess(false);
    };

    if (success) {
        return (
            <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                    <CheckCircle size={48} />
                </div>
                <h2>Your message has been sent successfully!</h2>
                <p>Thank you for contacting us. We will get back to you as soon as possible.</p>
                <button
                    onClick={handleBackToForm}
                    className={styles.backToFormButton}
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <section className={styles.contactSection}>
            <div className={styles.header}>
                <h2 className={`${styles.title} title`}>Contact Us</h2>
                <p>We look forward to hearing your opinions and suggestions</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                        Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Enter your full name"
                    />
                    {errors.name && (
                        <span className={styles.errorMessage}>{errors.name}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        placeholder="example@email.com"
                    />
                    {errors.email && (
                        <span className={styles.errorMessage}>{errors.email}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber" className={styles.label}>
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                        placeholder="01234567890"
                    />
                    {errors.phoneNumber && (
                        <span className={styles.errorMessage}>{errors.phoneNumber}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="comment" className={styles.label}>
                        Your Message *
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        className={`${styles.textarea} ${errors.comment ? styles.inputError : ''}`}
                        placeholder="Write your message or inquiry here..."
                        rows={4}
                    />
                    {errors.comment && (
                        <span className={styles.errorMessage}>{errors.comment}</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className={styles.spinner} size={16} />
                            Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </button>
            </form>
        </section>
    );
}